import { JSONSchema4 } from 'json-schema';
import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
import { orderGroups } from './utils/stylesheet-rational-order-groups.js';
import { astHelpersRN, ESTreeProp } from './utils/ast-helpers-react-native.js';

enum MessageCodes {
    PropsOrder = 'PropsOrder',
}

const messages: Record<MessageCodes, string> = {
    [MessageCodes.PropsOrder]: 'Property `{{currentName}}` should be before `{{prevName}}`.',
};

function create(context: TSESLint.RuleContext<keyof typeof MessageCodes, typeof schema>): TSESLint.RuleListener {
    const { borderInBoxModel }: { borderInBoxModel: boolean } = {
        borderInBoxModel: false,
        ...context.options[0],
    };

    const rationalGroups: string[] = orderGroups(borderInBoxModel);
    const sourceCode: TSESLint.SourceCode = context.getSourceCode();

    const findIndex = (prop: string): number => {
        const ix = rationalGroups.indexOf(prop);
        return ix >= 0 ? ix : 99999;
    };
    const isValidOrder = (a: string, b: string): boolean => findIndex(a) <= findIndex(b);

    function sort(array: TSESTree.Node[]) {
        return [...array].sort((a: TSESTree.Node, b: TSESTree.Node) => {
            const identifierA = findIndex(astHelpersRN.getStylePropertyIdentifier(a));
            const identifierB = findIndex(astHelpersRN.getStylePropertyIdentifier(b));
            if (identifierA < identifierB) {
                return -1;
            } else if (identifierA > identifierB) {
                return 1;
            }
            return 0;
        });
    }

    function report(array: TSESTree.Node[], type: any, node: any, prev: TSESTree.Property, current: TSESTree.Property) {
        const currentName = astHelpersRN.getStylePropertyIdentifier(current);
        const prevName = astHelpersRN.getStylePropertyIdentifier(prev);

        const hasComments = Boolean(
            array.find(
                (prop: TSESTree.Node) => sourceCode.getCommentsBefore(prop) || sourceCode.getCommentsAfter(prop),
            ),
        );

        context.report({
            node,
            messageId: MessageCodes.PropsOrder,
            data: { currentName, prevName },
            fix: hasComments
                ? undefined
                : (fixer: TSESLint.RuleFixer): TSESLint.RuleFix[] => {
                      const sortedArray = sort(array);
                      return array
                          .map((item: TSESTree.Node, i: number) =>
                              item === sortedArray[i]
                                  ? null
                                  : fixer.replaceText(item, sourceCode.getText(sortedArray[i])),
                          )
                          .filter((item: TSESLint.RuleFix) => !!item) as TSESLint.RuleFix[];
                  },
        });
    }

    function checkIsSorted(nodes: TSESTree.Node[], arrayName: string, node: any): void {
        for (let nodeIndex = 1, length = nodes.length; nodeIndex < length; nodeIndex += 1) {
            const previous = nodes[nodeIndex - 1];
            const current = nodes[nodeIndex];

            if (previous.type !== 'Property' || current.type !== 'Property') {
                return;
            }

            const prevName = astHelpersRN.getStylePropertyIdentifier(previous);
            const currentName = astHelpersRN.getStylePropertyIdentifier(current);

            if (!isValidOrder(prevName, currentName)) {
                return report(nodes, arrayName, node, previous, current);
            }
        }
    }

    return {
        CallExpression: function (node: TSESTree.Node) {
            if (!astHelpersRN.isStyleSheetDeclaration(node, context.settings)) {
                return;
            }
            const classDefinitionsChunks: ESTreeProp[][] = astHelpersRN.getStyleDeclarationsChunks(node);

            // if (!ignoreClassNames) {
            //   classDefinitionsChunks.forEach((classDefinitions) => {
            //     checkIsSorted(classDefinitions, 'class names', node);
            //   });
            // }

            // if (ignoreStyleProperties) {
            //   return;
            // }

            classDefinitionsChunks.forEach((classDefinitions: ESTreeProp[]) => {
                classDefinitions.forEach((classDefinition: ESTreeProp) => {
                    const styleProperties: ESTreeProp[] | undefined = classDefinition['value']?.properties;
                    if (!styleProperties || styleProperties.length < 2) {
                        return;
                    }
                    const stylePropertyChunks: ESTreeProp[][] = astHelpersRN.getPropertiesChunks(styleProperties);
                    stylePropertyChunks.forEach((stylePropertyChunk: ESTreeProp[]) =>
                        checkIsSorted(stylePropertyChunk, 'style properties', node),
                    );
                });
            });
        },
    };

    ///
}

const schema: JSONSchema4[] = [
    {
        type: 'object',
        additionalProperties: false,
        properties: {
            borderInBoxModel: {
                type: 'boolean',
                default: false,
            },
            // ignoreClassNames: {
            //     type: 'boolean',
            //     default: false,
            // },
            // ignoreStyleProperties: {
            //     type: 'boolean',
            //     default: false,
            // },
        },
    },
];

export const rule: TSESLint.RuleModule<keyof typeof MessageCodes, typeof schema, ReturnType<typeof create>> = {
    create,
    // name: 'stylesheet-rational-order',
    meta: {
        type: 'layout',
        docs: {
            description: 'Sorts related property declarations by grouping together.',
            recommended: 'error',
        },
        fixable: 'code',
        hasSuggestions: true,
        schema,
        messages,
    },
};
