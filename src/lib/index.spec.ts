import { sanitizeTagName } from './index';


describe('sanitizeTagName', () => {

    test('sanitizeTagName should replace white-spaces with underscore', () => {
        expect(sanitizeTagName('foo bar tag')).toEqual('foo_bar_tag');
    });

    test('sanitizeTagName should replace : with underscore', () => {
        expect(sanitizeTagName('foo:bar:tag')).toEqual('foo_bar_tag');
    });


    test('sanitizeTagName should replace / with underscore', () => {
        expect(sanitizeTagName('foo/bar/tag')).toEqual('foo_bar_tag');
    });

    test('sanitizeTagName should replace \\ with underscore', () => {
        expect(sanitizeTagName('foo\\bar\\tag')).toEqual('foo_bar_tag');
    });

    test('sanitizeTagName should not replace underscores', () => {
        expect(sanitizeTagName('foo_bar_tag')).toEqual('foo_bar_tag');
    });

    test('sanitizeTagName should not replace -', () => {
        expect(sanitizeTagName('foo-bar-tag')).toEqual('foo-bar-tag');
    });

    test('sanitizeTagName should not replace numbers', () => {
        expect(sanitizeTagName('foo-bar-10')).toEqual('foo-bar-10');
    });
});
