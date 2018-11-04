import { describe, it } from "mocha";
import { assert } from "chai";
import { DeliveryHideItemConverter, DeliveryHideItemGetter } from "../../../script/browser/delivery-hide-item";
import { IServiceEnabledSetting, ServiceEnabledSetting } from "../../../script/share/setting/service-enabled-setting";
import { MatchKind } from "../../../script/share/define/match-kind";

describe('DeliveryHideItemConverter', () => {

    const converter = new DeliveryHideItemConverter();

    function _s(): IServiceEnabledSetting {
        return new ServiceEnabledSetting();
    }

    it('empty', () => {
        assert.isNull(converter.convertItem('', _s()));
    });

    it('comment', () => {
        assert.isNull(converter.convertItem('#', _s()));
    });

    it('not :', () => {
        assert.isNull(converter.convertItem('abc', _s()));
    });

    for (const s of [
        { i: ':a', o: 'a' },
        { i: ':', o: '' },
        { i: 'a:', o: '' }
    ]) {
        it(`: only(${JSON.stringify(s)})`, () => {
            const result = converter.convertItem(s.i, _s());
            assert.deepEqual(result, {
                match: {
                    kind: MatchKind.partial,
                    case: false,
                },
                service: _s(),
                word: s.o,
            }, '@' + JSON.stringify(result));
        });
    }

    it(MatchKind.partial, () => {
        assert.strictEqual(converter.convertItem('*:', _s())!.match.kind, MatchKind.partial);
        assert.strictEqual(converter.convertItem(':', _s())!.match.kind, MatchKind.partial);
        assert.strictEqual(converter.convertItem('?:', _s())!.match.kind, MatchKind.partial);
    });
    it(MatchKind.forward, () => {
        assert.strictEqual(converter.convertItem('^:', _s())!.match.kind, MatchKind.forward);
    });
    it(MatchKind.perfect, () => {
        assert.strictEqual(converter.convertItem('=:', _s())!.match.kind, MatchKind.perfect);
    });
    it(MatchKind.regex, () => {
        assert.strictEqual(converter.convertItem('/:', _s())!.match.kind, MatchKind.regex);
    });

    it('case false', () => {
        assert.isFalse(converter.convertItem(',N:', _s())!.match.case);
        assert.isFalse(converter.convertItem(',n:', _s())!.match.case);
        assert.isFalse(converter.convertItem(',:', _s())!.match.case);
        assert.isFalse(converter.convertItem(',?:', _s())!.match.case);
        assert.isFalse(converter.convertItem(':', _s())!.match.case);
    });
    it('case true', () => {
        assert.isTrue(converter.convertItem(',Y:', _s())!.match.case);
        assert.isTrue(converter.convertItem(',y:', _s())!.match.case);
    });

    for (const s of [
        { i: ':a', o: 'a' },
        { i: ': a', o: 'a' },
        { i: ':a ', o: 'a' },
        { i: ': a ', o: 'a' },
        { i: '::', o: ':' },
        { i: ':,', o: ',' },
    ]) {
        it(`word(${JSON.stringify(s)})`, () => {
            const result = converter.convertItem(s.i, _s());
            assert.strictEqual(result!.word, s.o);
        });
    }
});

describe('DeliveryHideItemGetter', () => {

    const getter = new DeliveryHideItemGetter();

    it('empty', () => {
        const result = getter.split(``);
        assert.deepStrictEqual(result, {
            header: {
                url: '',
                name: '',
                author: '',
                version: '',
            },
            lines: [''],
        }, JSON.stringify(result));
    });

    it('line only 1', () => {
        const result = getter.split(`
        a
        b
        c
        `);
        assert.deepStrictEqual(result, {
            header: {
                url: '',
                name: '',
                author: '',
                version: '',
            },
            lines: ['', 'a', 'b', 'c', ''],
        }, JSON.stringify(result));
    });

    it('line only 2', () => {
        const result = getter.split(`a
        b
        c`);
        assert.deepStrictEqual(result, {
            header: {
                url: '',
                name: '',
                author: '',
                version: '',
            },
            lines: ['a', 'b', 'c'],
        }, JSON.stringify(result));
    });

    describe('split', () => {
        it('separator only', () => {
            const result = getter.split(`##`);
            assert.deepStrictEqual(result, {
                header: {
                    url: '',
                    name: '',
                    author: '',
                    version: '',
                },
                lines: [],
            }, JSON.stringify(result));
        });

        it('separator and single line', () => {
            const result = getter.split(`##
            a`);
            assert.deepStrictEqual(result, {
                header: {
                    url: '',
                    name: '',
                    author: '',
                    version: '',
                },
                lines: ['a'],
            }, JSON.stringify(result));
        });

        it('empty header and single line', () => {
            const result = getter.split(`#
#
##
            a`);
            assert.deepStrictEqual(result, {
                header: {
                    url: '',
                    name: '',
                    author: '',
                    version: '',
                },
                lines: ['a'],
            }, JSON.stringify(result));
        });

        it('empty header and double line', () => {
            const result = getter.split(`#
#
##
##
            a`);
            assert.deepStrictEqual(result, {
                header: {
                    url: '',
                    name: '',
                    author: '',
                    version: '',
                },
                lines: ['##', 'a'],
            }, JSON.stringify(result));
        });

        it('empty header and empty line', () => {
            const result = getter.split(`#
#
##`);
            assert.deepStrictEqual(result, {
                header: {
                    url: '',
                    name: '',
                    author: '',
                    version: '',
                },
                lines: [],
            }, JSON.stringify(result));
        });

        for(const input of [
            'name:NAME',
            'name :NAME',
            'name: NAME',
            'name : NAME',
            ' name : NAME ',
        ]) {
            it(`name header and empty line (${input})`, () => {
                const result = getter.split(`#
#${input}
##`);
                assert.deepStrictEqual(result, {
                    header: {
                        url: '',
                        name: 'NAME',
                        author: '',
                        version: '',
                    },
                    lines: [],
                }, JSON.stringify(result));
            });
        }

        it('ignore header and empty line', () => {
            const result = getter.split(`#
# NAME: name
# xxx: yyyy
##`);
            assert.deepStrictEqual(result, {
                header: {
                    url: '',
                    name: '',
                    author: '',
                    version: '',
                },
                lines: [],
            }, JSON.stringify(result));
        });

        it('all header and empty line', () => {
            const result = getter.split(`# name: A
# author: B
# version: C
##`);
            assert.deepStrictEqual(result, {
                header: {
                    url: '',
                    name: 'A',
                    author: 'B',
                    version: 'C',
                },
                lines: [],
            }, JSON.stringify(result));
        });

        it('last header and empty line', () => {
            const result = getter.split(`# name: A
# name: B
# name: C
##`);
            assert.deepStrictEqual(result, {
                header: {
                    url: '',
                    name: 'C',
                    author: '',
                    version: '',
                },
                lines: [],
            }, JSON.stringify(result));
        });


        it('illegal header', () => {
            const result = getter.split(`# name: A
# name: B

# name: C
##`);
            assert.deepStrictEqual(result, {
                header: {
                    url: '',
                    name: '',
                    author: '',
                    version: '',
                },
                lines: [
                    '# name: A',
                    '# name: B',
                    '',
                    '# name: C',
                    '##'
                ],
            }, JSON.stringify(result));
        });
    });

});
