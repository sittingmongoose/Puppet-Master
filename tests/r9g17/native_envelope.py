#!/usr/bin/env python3
import json
import re

IDENT = re.compile(r"[A-Za-z_][A-Za-z0-9_]*")
NUMBER = re.compile(r"-?(?:0|[1-9][0-9]*)")
WALL = re.compile(r"Script completed\nWall time (?:0|[1-9][0-9]*)(?:\.[0-9]+)? seconds\nOutput:\n")


class Invalid(ValueError):
    pass


def require(value, mismatch):
    if not value:
        raise Invalid(mismatch)


class Reader:
    def __init__(self, text):
        require(isinstance(text, str) and text.endswith("\n") and "\r" not in text and text.count("\n") == 1, "framing")
        self.text = text[:-1]
        self.pos = 0

    def ws(self):
        while self.pos < len(self.text) and self.text[self.pos] in " \t":
            self.pos += 1

    def literal(self, value):
        self.ws()
        require(self.text.startswith(value, self.pos), "literal:" + value)
        self.pos += len(value)

    def identifier(self):
        self.ws()
        match = IDENT.match(self.text, self.pos)
        require(match is not None, "identifier")
        self.pos = match.end()
        return match.group(0)

    def string(self):
        self.ws()
        require(self.pos < len(self.text) and self.text[self.pos] == '"', "string")
        try:
            value, end = json.JSONDecoder().raw_decode(self.text, self.pos)
        except json.JSONDecodeError as error:
            raise Invalid("json-string") from error
        require(isinstance(value, str), "string-type")
        self.pos = end
        return value

    def scalar(self):
        self.ws()
        if self.pos < len(self.text) and self.text[self.pos] == '"':
            return self.string()
        for word, value in (("true", True), ("false", False), ("null", None)):
            if self.text.startswith(word, self.pos):
                self.pos += len(word)
                return value
        match = NUMBER.match(self.text, self.pos)
        require(match is not None, "scalar")
        self.pos = match.end()
        return int(match.group(0))

    def object(self):
        self.literal("{")
        value = {}
        self.ws()
        if self.pos < len(self.text) and self.text[self.pos] == "}":
            self.pos += 1
            return value
        while True:
            self.ws()
            key = self.string() if self.pos < len(self.text) and self.text[self.pos] == '"' else self.identifier()
            require(key not in value, "duplicate-key:" + key)
            self.literal(":")
            value[key] = self.scalar()
            self.ws()
            require(self.pos < len(self.text), "object-eof")
            if self.text[self.pos] == "}":
                self.pos += 1
                return value
            require(self.text[self.pos] == ",", "object-separator")
            self.pos += 1


def parse_call(text):
    reader = Reader(text)
    reader.literal("const")
    require(reader.identifier() == "r", "binding-name")
    reader.literal("=")
    reader.literal("await")
    reader.literal("tools")
    reader.literal(".")
    tool = reader.identifier()
    require(tool in {"create_goal", "exec_command", "update_goal"}, "tool")
    reader.literal("(")
    arguments = reader.object()
    reader.literal(")")
    reader.literal(";")
    reader.literal("text")
    reader.literal("(")
    reader.literal("r")
    output_mode = "result"
    reader.ws()
    if reader.pos < len(reader.text) and reader.text[reader.pos] == ".":
        reader.pos += 1
        require(reader.identifier() == "output", "output-property")
        output_mode = "output"
    reader.literal(")")
    reader.literal(";")
    reader.ws()
    session_tail = False
    tail = "if (r.session_id) text(JSON.stringify(r));"
    if reader.text.startswith(tail, reader.pos):
        reader.pos += len(tail)
        session_tail = True
    reader.ws()
    require(reader.pos == len(reader.text), "trailing")
    require((tool == "exec_command" and output_mode == "output") or (tool != "exec_command" and output_mode == "result"), "output-mode")
    require(not session_tail or tool == "exec_command", "session-tail-tool")
    return {"arguments": arguments, "output_mode": output_mode, "session_tail": session_tail, "tool": tool}


def unwrap_output(value):
    require(isinstance(value, list) and len(value) == 2, "output-block-count")
    require(value[0].get("type") == "input_text" and set(value[0]) == {"text", "type"} and isinstance(value[0]["text"], str) and WALL.fullmatch(value[0]["text"]), "output-header")
    require(value[1].get("type") == "input_text" and set(value[1]) == {"text", "type"} and isinstance(value[1]["text"], str), "output-body")
    return value[1]["text"]


__all__ = ("Invalid", "parse_call", "unwrap_output")
