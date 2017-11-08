BABEL = ./node_modules/.bin/babel
BIN_DIR = bin

all: lib

lib: src
	$(BABEL) src -d lib >&2; \
	rm -rf bin/rnpreparesvg.js >&2; \
	test ! -d $(BIN_DIR) && mkdir $(BIN_DIR) >&2; \
	mv lib/rnpreparesvg.js bin/rnpreparesvg.js >&2; \

clean:
	rm -rf lib/ bin/

build:
	@status=$$(git status ./src --porcelain); \
	if test "x$${status}" != x; then \
		echo Building... >&2; \
		make lib bin >&2; \
		git add ./lib >&2; \
	fi

test:
	@./node_modules/.bin/mocha \
		--reporter spec \
		--require should \
		--require babel-core/register \
		--recursive \
		test

.PHONY: test clean lib
