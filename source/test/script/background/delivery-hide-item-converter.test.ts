import { describe, it } from "mocha";
import { assert } from "chai";
import { DeliveryHideItemConverter } from "../../../script/background/delivery-hide-item-converter";
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
