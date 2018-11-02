import { describe, it } from "mocha";
import { assert } from "chai"
import { SelectorConverter, ElementId, ElementClass, ElementName, ElementData } from "../../../../script/share/define/element-names";

describe('SelectorConverter', () => {

    describe('fromId', () => {

        it('none', () => {
            assert.strictEqual(SelectorConverter.fromId('' as ElementId), '#');
        });

        it('#', () => {
            assert.strictEqual(SelectorConverter.fromId('#' as ElementId), '##');
        });

        it('simple', () => {
            assert.strictEqual(SelectorConverter.fromId('test' as ElementId), '#test');
        });

    });

    describe('fromClass', () => {

        it('none', () => {
            assert.strictEqual(SelectorConverter.fromClass('' as ElementClass), '.');
        });

        it('.', () => {
            assert.strictEqual(SelectorConverter.fromClass('.' as ElementClass), '..');
        });

        it('simple', () => {
            assert.strictEqual(SelectorConverter.fromClass('test' as ElementClass), '.test');
        });

    });

    describe('fromName', () => {

        it('none', () => {
            assert.strictEqual(SelectorConverter.fromName('' as ElementName), '[name=""]');
        });

        it('.', () => {
            assert.strictEqual(SelectorConverter.fromName('"' as ElementName), '[name="""]');
        });

        it('simple', () => {
            assert.strictEqual(SelectorConverter.fromName('test' as ElementName), '[name="test"]');
        });

    });

    describe('fromName', () => {

        it('none', () => {
            assert.strictEqual(SelectorConverter.fromData('' as ElementData), '[data-]');
        });

        it('simple', () => {
            assert.strictEqual(SelectorConverter.fromData('test' as ElementData), '[data-test]');
        });

        it('a-b', () => {
            assert.strictEqual(SelectorConverter.fromData('a-b' as ElementData), '[data-a-b]');
        });

        it('testAndTest', () => {
            assert.strictEqual(SelectorConverter.fromData('testAndTest' as ElementData), '[data-test-and-test]');
        });

    });

});