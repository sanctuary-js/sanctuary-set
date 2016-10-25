ESLINT = node_modules/.bin/eslint --config node_modules/sanctuary-style/eslint-es6.json --env es6
MOCHA = node_modules/.bin/mocha
NPM = npm

SRC = $(shell find src -name '*.js' | sort)
TEST = $(shell find test -name '*.js' | sort)


.PHONY: all
all: LICENSE

.PHONY: LICENSE
LICENSE:
	cp -- '$@' '$@.orig'
	sed 's/Copyright (c) .* Sanctuary/Copyright (c) $(shell git log --date=format:%Y --pretty=format:%ad | sort -r | head -n 1) Sanctuary/' '$@.orig' >'$@'
	rm -- '$@.orig'


.PHONY: lint
lint:
	$(ESLINT) \
	  --env node \
	  --rule 'comma-dangle: [off]' \
	  --rule 'func-style: [off]' \
	  --rule 'max-len: [off]' \
	  --rule 'no-case-declarations: [off]' \
	  --rule 'prefer-arrow-callback: [off]' \
	  -- $(SRC)
	$(ESLINT) \
	  --env node \
	  --env mocha \
	  --rule 'max-len: [off]' \
	  --rule 'prefer-template: [off]' \
	  -- $(TEST)


.PHONY: setup
setup:
	$(NPM) install


.PHONY: test
test:
	$(MOCHA) --recursive -- test
