import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/experimental-utils';

export type ESTreeProp = TSESTree.ObjectLiteralElementLike | TSESTree.Property | TSESTree.RestElement;

let currentContent;
const getSourceCode = (node: TSESTree.ConditionalExpression) => currentContent.getSourceCode(node).getText(node);

export const getStyleSheetObjectNames = (settings) =>
    settings['react-native/style-sheet-object-names'] || ['StyleSheet'];

export const astHelpersRN = {
    containsStyleSheetObject: function (
        node: TSESTree.Node,
        objectNames: Array<TSESTree.JSXTagNameExpression | string>,
    ): boolean {
        return Boolean(
            node &&
                node.type === AST_NODE_TYPES.CallExpression &&
                node.callee &&
                'object' in node.callee &&
                node.callee.object &&
                'name' in node.callee.object &&
                node.callee.object.name &&
                objectNames.includes(node.callee.object.name),
        );
    },

    containsCreateCall: function (node: TSESTree.Node): boolean {
        return Boolean(
            node &&
                'callee' in node &&
                node.callee &&
                'property' in node.callee &&
                node.callee.property &&
                'name' in node.callee.property &&
                node.callee.property.name &&
                node.callee.property.name === 'create',
        );
    },

    isStyleSheetDeclaration: function (node: TSESTree.Node, settings): boolean {
        const objectNames = getStyleSheetObjectNames(settings);
        return Boolean(
            astHelpersRN.containsStyleSheetObject(node, objectNames) && astHelpersRN.containsCreateCall(node),
        );
    },

    // getStyleSheetName: function (node) {
    //     if (node && node.parent && node.parent.id) {
    //         return node.parent.id.name;
    //     }
    // },

    // getStyleDeclarations: function (node) {
    //     if (
    //         node
    //         && node.type === 'CallExpression'
    //         && node.arguments
    //         && node.arguments[0]
    //         && node.arguments[0].properties
    //     ) {
    //         return node.arguments[0].properties.filter((property) => property.type === 'Property');
    //     }
    //     return [];
    // },

    getStyleDeclarationsChunks: function (node: TSESTree.Node): ESTreeProp[][] {
        if (
            node &&
            node.type === AST_NODE_TYPES.CallExpression &&
            node.arguments &&
            node.arguments[0] &&
            'properties' in node.arguments[0] &&
            node.arguments[0].properties
        ) {
            const { properties } = node.arguments[0];
            const result: ESTreeProp[][] = [];
            let chunk: ESTreeProp[] = [];
            for (let i = 0; i < properties.length; i += 1) {
                const property = properties[i];
                if (property.type === AST_NODE_TYPES.Property) {
                    chunk.push(property);
                } else if (chunk.length) {
                    result.push(chunk);
                    chunk = [];
                }
            }
            if (chunk.length) {
                result.push(chunk);
            }
            return result;
        }
        return [];
    },

    getPropertiesChunks: function (properties: ESTreeProp[]): ESTreeProp[][] {
        const result: ESTreeProp[][] = [];
        let chunk: ESTreeProp[] = [];
        for (let i = 0; i < properties.length; i += 1) {
            const property = properties[i];
            if (property.type === AST_NODE_TYPES.Property) {
                chunk.push(property);
            } else if (chunk.length) {
                result.push(chunk);
                chunk = [];
            }
        }
        if (chunk.length) {
            result.push(chunk);
        }
        return result;
    },

    getExpressionIdentifier: function (node: TSESTree.Node): string {
        if (node) {
            switch (node.type) {
                case AST_NODE_TYPES.Identifier:
                    return node.name;
                case AST_NODE_TYPES.Literal:
                    return node.value ? node.value.toString() : '';
                case AST_NODE_TYPES.TemplateLiteral:
                    return node.quasis.reduce(
                        (result, quasi, index) =>
                            result + quasi.value.cooked + astHelpersRN.getExpressionIdentifier(node.expressions[index]),
                        '',
                    );
                default:
                    return '';
            }
        }
        return '';
    },

    getStylePropertyIdentifier: function (node: TSESTree.Node): string {
        if (node && 'key' in node && node.key) {
            return astHelpersRN.getExpressionIdentifier(node.key);
        }
        return ''; // fallback ?
    },

    // isStyleAttribute: function (node) {
    //     return Boolean(
    //         node.type === 'JSXAttribute'
    //         && node.name
    //         && node.name.name
    //         && node.name.name.toLowerCase().includes('style')
    //     );
    // },

    // collectStyleObjectExpressions: function (node, context) {
    //     currentContent = context;
    //     if (astHelpersRN.hasArrayOfStyleReferences(node)) {
    //         const styleReferenceContainers = node.expression.elements;
    //         return astHelpersRN.collectStyleObjectExpressionFromContainers(styleReferenceContainers);
    //     } if (node && node.expression) {
    //         return astHelpersRN.getStyleObjectExpressionFromNode(node.expression);
    //     }
    //     return [];
    // },

    // collectColorLiterals: function (node, context) {
    //     if (!node) {
    //         return [];
    //     }
    //     currentContent = context;
    //     if (astHelpersRN.hasArrayOfStyleReferences(node)) {
    //         const styleReferenceContainers = node.expression.elements;
    //         return astHelpersRN.collectColorLiteralsFromContainers(styleReferenceContainers);
    //     }
    //     if (node.type === 'ObjectExpression') {
    //         return astHelpersRN.getColorLiteralsFromNode(node);
    //     }
    //     return astHelpersRN.getColorLiteralsFromNode(node.expression);
    // },

    // collectStyleObjectExpressionFromContainers: function (nodes) {
    //     let objectExpressions = [];
    //     nodes.forEach((node) => {
    //         objectExpressions = objectExpressions
    //             .concat(astHelpersRN.getStyleObjectExpressionFromNode(node));
    //     });
    //     return objectExpressions;
    // },

    // collectColorLiteralsFromContainers: function (nodes) {
    //     let colorLiterals = [];
    //     nodes.forEach((node) => {
    //         colorLiterals = colorLiterals
    //             .concat(astHelpersRN.getColorLiteralsFromNode(node));
    //     });
    //     return colorLiterals;
    // },

    // getStyleReferenceFromNode: function (node: TSESTree.Node): string[] {
    //     if (!node) { return []; }
    //     let styleReference: string;
    //     let leftStyleReferences: string[];
    //     let rightStyleReferences: string[];
    //     switch (node.type) {
    //         case AST_NODE_TYPES.MemberExpression:
    //             styleReference = astHelpersRN.getStyleReferenceFromExpression(node);
    //             return [styleReference];
    //         case AST_NODE_TYPES.LogicalExpression:
    //             leftStyleReferences = astHelpersRN.getStyleReferenceFromNode(node.left);
    //             rightStyleReferences = astHelpersRN.getStyleReferenceFromNode(node.right);
    //             return [...leftStyleReferences, ...rightStyleReferences];
    //         case AST_NODE_TYPES.ConditionalExpression:
    //             leftStyleReferences = astHelpersRN.getStyleReferenceFromNode(node.consequent);
    //             rightStyleReferences = astHelpersRN.getStyleReferenceFromNode(node.alternate);
    //             return [...leftStyleReferences, ...rightStyleReferences];
    //         default:
    //             return [];
    //     }
    // },

    // getStyleObjectExpressionFromNode: function (node: TSESTree.Node): string[] {
    //     if (!node) { return []; }
    //     let leftStyleObjectExpression;
    //     let rightStyleObjectExpression;
    //     if (node.type === AST_NODE_TYPES.ObjectExpression) {
    //         return [astHelpersRN.getStyleObjectFromExpression(node)];
    //     }
    //     switch (node.type) {
    //         case AST_NODE_TYPES.LogicalExpression:
    //             leftStyleObjectExpression = astHelpersRN.getStyleObjectExpressionFromNode(node.left);
    //             rightStyleObjectExpression = astHelpersRN.getStyleObjectExpressionFromNode(node.right);
    //             return [...leftStyleObjectExpression, ...rightStyleObjectExpression];
    //         case AST_NODE_TYPES.ConditionalExpression:
    //             leftStyleObjectExpression = astHelpersRN.getStyleObjectExpressionFromNode(node.consequent);
    //             rightStyleObjectExpression = astHelpersRN.getStyleObjectExpressionFromNode(node.alternate);
    //             return [...leftStyleObjectExpression, ...rightStyleObjectExpression];
    //         default:
    //             return [];
    //     }
    // },

    // getColorLiteralsFromNode: function (node: TSESTree.Node) {
    //     if (!node) { return []; }
    //     let leftColorLiterals;
    //     let rightColorLiterals;
    //     if (node.type === AST_NODE_TYPES.ObjectExpression) {
    //         return [astHelpersRN.getColorLiteralsFromExpression(node)];
    //     }
    //     switch (node.type) {
    //         case AST_NODE_TYPES.LogicalExpression:
    //             leftColorLiterals = astHelpersRN.getColorLiteralsFromNode(node.left);
    //             rightColorLiterals = astHelpersRN.getColorLiteralsFromNode(node.right);
    //             return [...leftColorLiterals, ...rightColorLiterals];
    //         case AST_NODE_TYPES.ConditionalExpression:
    //             leftColorLiterals = astHelpersRN.getColorLiteralsFromNode(node.consequent);
    //             rightColorLiterals = astHelpersRN.getColorLiteralsFromNode(node.alternate);
    //             return [...leftColorLiterals, ...rightColorLiterals];
    //         default:
    //             return [];
    //     }
    // },

    // hasArrayOfStyleReferences: function (node) {
    //     return node
    //         && Boolean(
    //             node.type === 'JSXExpressionContainer'
    //             && node.expression
    //             && node.expression.type === 'ArrayExpression'
    //         );
    // },

    // getStyleReferenceFromExpression: function (node: TSESTree.Node): string {
    //     const result: string[] = [];
    //     const name = astHelpersRN.getObjectName(node);
    //     if (name) {
    //         result.push(name);
    //     }
    //     const property = astHelpersRN.getPropertyName(node);
    //     if (property) {
    //         result.push(property);
    //     }
    //     return result.join('.');
    // },

    // getStyleObjectFromExpression: function (node): string {
    //     const obj = {};
    //     let invalid = false;
    //     if (node.properties && node.properties.length) {
    //         // @ts-ignore
    //         node.properties.forEach((p) => {
    //             if (!p.value || !p.key) {
    //                 return;
    //             }
    //             if (p.value.type === AST_NODE_TYPES.Literal) {
    //                 invalid = true;
    //                 // @ts-ignore
    //                 obj[p.key.name] = p.value.value;
    //             } else if (p.value.type === AST_NODE_TYPES.ConditionalExpression) {
    //                 const innerNode = p.value;
    //                 if (
    //                     innerNode.consequent.type === AST_NODE_TYPES.Literal
    //                     || innerNode.alternate.type === AST_NODE_TYPES.Literal
    //                 ) {
    //                     invalid = true;
    //                     // @ts-ignore
    //                     obj[p.key.name] = getSourceCode(innerNode);
    //                 }
    //             } else if (
    //                 p.value.type === AST_NODE_TYPES.UnaryExpression
    //                 && p.value.operator === '-'
    //                 && p.value.argument.type === AST_NODE_TYPES.Literal
    //             ) {
    //                 invalid = true;
    //                 // @ts-ignore
    //                 obj[p.key.name] = -1 * p.value.argument.value;
    //             } else if (
    //                 p.value.type === AST_NODE_TYPES.UnaryExpression
    //                 && p.value.operator === '+'
    //                 && p.value.argument.type === AST_NODE_TYPES.Literal
    //             ) {
    //                 invalid = true;
    //                 // @ts-ignore
    //                 obj[p.key.name] = p.value.argument.value;
    //             }
    //         });
    //     }
    //     return invalid ? { expression: obj, node: node } : undefined;
    // },

    getColorLiteralsFromExpression: function (node) {
        const obj = {};
        let invalid = false;
        if (node.properties && node.properties.length) {
            node.properties.forEach((p) => {
                if (p.key && p.key.name && p.key.name.toLowerCase().indexOf('color') !== -1) {
                    if (p.value.type === AST_NODE_TYPES.Literal) {
                        invalid = true;
                        obj[p.key.name] = p.value.value;
                    } else if (p.value.type === AST_NODE_TYPES.ConditionalExpression) {
                        const innerNode = p.value;
                        if (
                            innerNode.consequent.type === AST_NODE_TYPES.Literal ||
                            innerNode.alternate.type === AST_NODE_TYPES.Literal
                        ) {
                            invalid = true;
                            obj[p.key.name] = getSourceCode(innerNode);
                        }
                    }
                }
            });
        }
        return invalid ? { expression: obj, node: node } : undefined;
    },

    getObjectName: function (node: TSESTree.Node): string | void {
        if (node && 'object' in node && node.object && 'name' in node.object && node.object.name) {
            return node.object.name.toString();
        }
    },

    getPropertyName: function (node: TSESTree.Node): string | void {
        if (node && 'property' in node && node.property && 'name' in node.property && node.property.name) {
            return node.property.name.toString();
        }
    },

    // getPotentialStyleReferenceFromMemberExpression: function (node) {
    //     if (
    //         node
    //         && node.object
    //         && node.object.type === 'Identifier'
    //         && node.object.name
    //         && node.property
    //         && node.property.type === 'Identifier'
    //         && node.property.name
    //         && node.parent.type !== 'MemberExpression'
    //     ) {
    //         return [node.object.name, node.property.name].join('.');
    //     }
    // },

    // isEitherShortHand: function (property1, property2) {
    //     const shorthands = ['margin', 'padding', 'border', 'flex'];
    //     if (shorthands.includes(property1)) {
    //         return property2.startsWith(property1);
    //     } if (shorthands.includes(property2)) {
    //         return property1.startsWith(property2);
    //     }
    //     return false;
    // },
};
