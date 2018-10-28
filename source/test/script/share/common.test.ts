import { describe, it } from "mocha";
import { assert } from "chai"
import { merge } from "../../../script/share/common";

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

})