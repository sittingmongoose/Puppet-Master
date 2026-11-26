/* Validate the immediate edges of an exact dict/list/tuple graph under the GIL.
 * Only exported CPython functions are used. No object layouts or headers are needed.
 * The caller passes an array of [address, type, size, child addresses...] rows
 * in ancestor-before-descendant order. See _PlainWalk for the lifetime invariant.
 */
#include <stddef.h>
#include <stdint.h>

typedef struct _object PyObject;
typedef intptr_t Py_ssize_t;

extern PyObject *PyObject_Type(PyObject *object);
extern void Py_DecRef(PyObject *object);
extern Py_ssize_t PyDict_Size(PyObject *dict);
extern int PyDict_Next(PyObject *dict, Py_ssize_t *position, PyObject **key, PyObject **value);
extern Py_ssize_t PyList_Size(PyObject *list);
extern PyObject *PyList_GetItem(PyObject *list, Py_ssize_t index);
extern Py_ssize_t PyTuple_Size(PyObject *tuple);
extern PyObject *PyTuple_GetItem(PyObject *tuple, Py_ssize_t index);
extern int PyList_Append(PyObject *list, PyObject *item);

int dg5_owner_state_guard(const uintptr_t *edges, size_t rows, PyObject *dict_type,
                          PyObject *list_type, PyObject *pinned)
{
    const uintptr_t *entry = edges;
    for (size_t row = 0; row < rows; ++row) {
        PyObject *object = (PyObject *)*entry++;
        PyObject *expected = (PyObject *)*entry++;
        Py_ssize_t size = (Py_ssize_t)*entry++;
        PyObject *actual = PyObject_Type(object);
        if (actual == NULL) {
            return -1;
        }
        int matches = actual == expected;
        Py_DecRef(actual);
        if (!matches) {
            return 0;
        }
        if (expected == dict_type) {
            if (PyDict_Size(object) != size) {
                return 0;
            }
            Py_ssize_t position = 0;
            PyObject *key, *value;
            for (Py_ssize_t index = 0; index < size; ++index) {
                if (!PyDict_Next(object, &position, &key, &value) ||
                    (uintptr_t)key != entry[0] || (uintptr_t)value != entry[1]) {
                    return 0;
                }
                entry += 2;
            }
        } else {
            int list = expected == list_type;
            if ((list ? PyList_Size(object) : PyTuple_Size(object)) != size) {
                return 0;
            }
            for (Py_ssize_t index = 0; index < size; ++index) {
                PyObject *child = list ? PyList_GetItem(object, index) : PyTuple_GetItem(object, index);
                if ((uintptr_t)child != *entry++) {
                    return 0;
                }
            }
        }
    }

    /* Retain the exact containers only for the rest of this Walk, just like
     * visit() does. Before returning success no caller code has run. */
    entry = edges;
    for (size_t row = 0; row < rows; ++row) {
        PyObject *object = (PyObject *)*entry++;
        PyObject *kind = (PyObject *)*entry++;
        size_t size = (size_t)*entry++;
        entry += kind == dict_type ? 2 * size : size;
        if (PyList_Append(pinned, object) < 0) {
            return -1;
        }
    }
    return 1;
}
