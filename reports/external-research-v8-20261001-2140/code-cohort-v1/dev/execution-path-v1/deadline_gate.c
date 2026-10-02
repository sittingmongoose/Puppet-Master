/* A lifetime gate, not a candidate tool. Static Linux executable. */
#define _GNU_SOURCE
#include <errno.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <signal.h>
#include <sys/prctl.h>
#include <sys/wait.h>
#include <time.h>
#include <unistd.h>

static uint64_t now_ns(void) {
    struct timespec t;
    if (clock_gettime(CLOCK_MONOTONIC, &t)) _exit(126);
    return (uint64_t)t.tv_sec * 1000000000ULL + (uint64_t)t.tv_nsec;
}
static uint64_t number(const char *s) {
    char *end; errno = 0;
    unsigned long long n = strtoull(s, &end, 10);
    if (errno || !s[0] || *end || s[0] == '-') _exit(126);
    return n;
}
int main(int argc, char **argv) {
    /* First host time, before admission, files, metadata or subprocesses. */
    uint64_t entered = now_ns();
    if (argc < 5 || strcmp(argv[1], "--absolute-ns") || strcmp(argv[3], "--")) return 126;
    uint64_t deadline = number(argv[2]);
    if (!deadline || entered >= deadline || now_ns() >= deadline) return 124;
    struct sigevent event = {.sigev_notify = SIGEV_SIGNAL, .sigev_signo = SIGKILL};
    timer_t timer;
    if (timer_create(CLOCK_MONOTONIC, &event, &timer)) return 126;
    struct itimerspec ts = {.it_value = {.tv_sec = deadline / 1000000000ULL,
                                       .tv_nsec = deadline % 1000000000ULL}};
    if (timer_settime(timer, TIMER_ABSTIME, &ts, NULL)) return 126;
    char bound[32];
    if (snprintf(bound, sizeof(bound), "%llu", (unsigned long long)deadline) < 0 || setenv("PM_BOUND_DEADLINE_NS", bound, 1)) return 126;
    /* Never disarm: the kernel owns expiry even if fork/wait/file operations stall. */
    pid_t owner = getpid();
    if (now_ns() >= deadline) return 124;
    pid_t child = fork();
    if (child < 0) return 126;
    if (child == 0) {
        if (prctl(PR_SET_PDEATHSIG, SIGKILL) || getppid() != owner || now_ns() >= deadline) _exit(124);
        execv(argv[4], argv + 4);
        _exit(126);
    }
    int status;
    for (;;) {
        pid_t got = waitpid(child, &status, 0);
        if (got == child) break;
        if (got < 0 && errno != EINTR) return 126;
    }
    /* As namespace PID 1, exit makes Linux terminate ALL namespace descendants,
       regardless of process group/session. Outside it, systemd owns the cgroup. */
    return WIFEXITED(status) ? WEXITSTATUS(status) : 128 + WTERMSIG(status);
}
