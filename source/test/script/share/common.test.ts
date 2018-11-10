import { describe, it } from "mocha";
import { assert } from "chai";
import { merge, isNullOrEmpty, checkService } from "../../../script/share/common";
import { ServiceKind } from "../../../script/share/define/service-kind";

describe('merge', () => {
    it('normal', () => {
        const src = {
            a: 1,
        };
        const dst = {
            a: 0,
        };
        const test = merge(src, dst);
        assert.equal(src, test);
        assert.deepStrictEqual(src, {
            a: 0
        }, JSON.stringify(src));
    });

    it('add', () => {
        const src = {
            a: 1,
        };
        const dst = {
            a: 0,
            b: 1,
        };
        const test = merge(src, dst);
        assert.equal(src, test);
        assert.deepStrictEqual(src as any, {
            a: 0,
            b: 1,
        }, JSON.stringify(src));
        assert.notStrictEqual(src as any, {
            a: 1
        }, JSON.stringify(src));
    });

    it('nest', () => {
        const src = {
            a: 1,
            b: {
                b1: 2
            },
            c: {
                c1: [
                    10,
                    20,
                ]
            }
        };
        const dst = {
            a: 1,
            b: {
                b2: 20
            },
            c: {
                c1: [
                    10,
                    100,
                ],
                c2: 'test'
            }
        };
        const test = merge(src as any, dst);
        assert.equal(src, test);
        assert.deepStrictEqual(src as any, {
            a: 1,
            b: {
                b1: 2,
                b2: 20
            },
            c: {
                c1: [
                    10,
                    100,
                ],
                c2: 'test'
            }
        }, JSON.stringify(src));
    });

});

describe('isNullOrEmpty', () => {
    it('empty', () => {
        assert.isTrue(isNullOrEmpty(null));
        assert.isTrue(isNullOrEmpty(undefined));
        assert.isTrue(isNullOrEmpty(""));
        assert.isNotTrue(isNullOrEmpty(" "));
        assert.isNotTrue(isNullOrEmpty("a"));
    });
});

describe('checkService', () => {
    it('google', () => {
        assert.isTrue(checkService(ServiceKind.google, { google: true, bing: false }));
        assert.isFalse(checkService(ServiceKind.google, { google: false, bing: false }));
    });
    it('bing', () => {
        assert.isTrue(checkService(ServiceKind.bing, { google: false, bing: true }));
        assert.isFalse(checkService(ServiceKind.bing, { google: false, bing: false }));
    });
});

