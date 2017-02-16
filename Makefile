ESLINT = node_modules/.bin/eslint --config node_modules/sanctuary-style/eslint-es6.json --env es6
ISTANBUL = node_modules/.bin/istanbul
NPM = npm

SRC = $(shell find src -name '*.js' | sort)
TEST = $(shell find test -name '*.js' | sort)


.PHONY: all
all: LICENSE

.PHONY: LICENSE
LICENSE:
	cp -- '$@' '$@.orig'
	sed 's/Copyright (c) .* Sanctuary/Copyright (c) $(shell git log --date=short --pretty=format:%ad | sort -r | head -n 1 | cut -d - -f 1) Sanctuary/' '$@.orig' >'$@'
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
	$(ISTANBUL) cover node_modules/.bin/_mocha -- --recursive
	$(ISTANBUL) check-coverage --branches 98
