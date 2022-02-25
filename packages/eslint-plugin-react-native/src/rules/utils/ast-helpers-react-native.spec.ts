import { getStyleSheetObjectNames } from './ast-helpers-react-native.js';

describe('astHelpers / getStyleSheetObjectNames', () => {
    it('should return empty array', () => {
        expect(getStyleSheetObjectNames({ 'react-native/style-sheet-object-names': [] })).toEqual([]);
    });
});
