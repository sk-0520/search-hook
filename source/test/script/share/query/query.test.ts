import { describe, it } from "mocha";
import { assert } from "chai"
import { QueryBase } from "../../../../script/share/query/query";
import { ServiceKind } from "../../../../script/share/define/service-kind";

const q = new class CommonQuery extends QueryBase {
    public service = ServiceKind.google;
    constructor() {
        super("CommonQuery");
    }
}

describe('split', () => {

    it('none', () => {
        const a = q.split('');
        assert.deepStrictEqual(a, [], JSON.stringify(a));
    });

    it('single', () => {
        const a = q.split('aaa');
        assert.deepStrictEqual(a, ['aaa'], JSON.stringify(a));
    });

    it('double', () => {
        const a = q.split('aaa bbb');
        assert.deepStrictEqual(a, ['aaa', 'bbb'], JSON.stringify(a));
    });

    it('ignore space', () => {
        const a = q.split('     aaa      bbb            ccc ddd         ');
        assert.deepStrictEqual(a, ['aaa', 'bbb', 'ccc', 'ddd'], JSON.stringify(a));
    });

    it('quot', () => {
        const a = q.split('aaa "bbb" ccc');
        assert.deepStrictEqual(a, ['aaa', 'bbb', 'ccc'], JSON.stringify(a));
    });

    it('quot space', () => {
        const a = q.split('aaa "bbb ccc" ddd');
        assert.deepStrictEqual(a, ['aaa', 'bbb ccc', 'ddd'], JSON.stringify(a));
    });

    it('broken quot', () => {
        const a = q.split('aaa "bbb ccc ddd');
        assert.deepStrictEqual(a, ['aaa', 'bbb ccc ddd'], JSON.stringify(a));
    });

});

describe('addNotItemWords', () => {

    it('simple', () => {
        const a = q.addNotItemWords(['aaa'], ['bbb']);
        assert.deepStrictEqual(a, {
            users: ['aaa'],
            applications: ['-bbb'],
        }, JSON.stringify(a));
    });

    it('not add', () => {
        const a = q.addNotItemWords(['aaa', 'bbb', 'ccc'], []);
        assert.deepStrictEqual(a, {
            users: ['aaa', 'bbb', 'ccc'],
            applications: [],
        }, JSON.stringify(a));
    });

    it('add only', () => {
        const a = q.addNotItemWords([], ['aaa', 'bbb', 'ccc']);
        assert.deepStrictEqual(a, {
            users: [],
            applications: ['-aaa', '-bbb', '-ccc'],
        }, JSON.stringify(a));
    });

    it('has not item', () => {
        const a = q.addNotItemWords(['aaa', '-bbb'], ['bbb', 'ccc']);
        assert.deepStrictEqual(a, {
            users: ['aaa', '-bbb'],
            applications: ['-ccc'],
        }, JSON.stringify(a));
    });

    it('has not item2', () => {
        const a = q.addNotItemWords(['aaa', '-bbb', 'ccc'], ['bbb', 'ccc']);
        assert.deepStrictEqual(a, {
            users: ['aaa', '-bbb', 'ccc'],
            applications: ['-ccc'],
        }, JSON.stringify(a));
    });

});

describe('getUserInput', () => {

    it('user only', () => {
        const a = q.getUserInput(['aaa'], []);
        assert.deepStrictEqual(a, ['aaa'], JSON.stringify(a));
    });

    it('not word only', () => {
        const a = q.getUserInput([], ['aaa']);
        assert.deepStrictEqual(a, [], JSON.stringify(a));
    });

    it('no hit', () => {
        const a = q.getUserInput(['aaa'], ['aaa']);
        assert.deepStrictEqual(a, ['aaa'], JSON.stringify(a));
    });

    it('hit', () => {
        const a = q.getUserInput(['-aaa'], ['aaa']);
        assert.deepStrictEqual(a, [], JSON.stringify(a));
    });

    it('hit2', () => {
        const a = q.getUserInput(['aaa', '-aaa', 'bbb', '-ccc'], ['aaa', 'bbb']);
        assert.deepStrictEqual(a, ['aaa', 'bbb', '-ccc'], JSON.stringify(a));
    });

});

describe('toString', () => {

    it('empty', () => {
        const a = q.toString([]);
        assert.deepStrictEqual(a, '', JSON.stringify(a));
    });

    it('simple', () => {
        const a = q.toString(['aaa']);
        assert.deepStrictEqual(a, 'aaa', JSON.stringify(a));
    });

    it('simple not word', () => {
        const a = q.toString(['aaa', '-bbb', 'ccc']);
        assert.deepStrictEqual(a, 'aaa -bbb ccc', JSON.stringify(a));
    });

    it('quot', () => {
        const a = q.toString(['aaa', 'bbb ccc', 'ddd']);
        assert.deepStrictEqual(a, 'aaa "bbb ccc" ddd', JSON.stringify(a));
    });

});

describe('split -> toString', () => {
    
    it('test 1', () => {
        const str = 'a b c';
        const arr = q.split(str);
        const a = q.toString(arr);
        assert.deepStrictEqual(a, 'a b c', JSON.stringify(a));
    });

    it('test 2', () => {
        const str = '     a      b       c     ';
        const arr = q.split(str);
        const a = q.toString(arr);
        assert.deepStrictEqual(a, 'a b c', JSON.stringify(a));
    });

    it('test 3', () => {
        const str = 'a "b c" d';
        const arr = q.split(str);
        const a = q.toString(arr);
        assert.deepStrictEqual(a, 'a "b c" d', JSON.stringify(a));
    });

});
