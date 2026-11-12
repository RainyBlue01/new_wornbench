



// 缩放控制（已移除，流程图由 FlowChart 组件承载）

/**
 * 根据currentNodesIds和processConfig获取当前节点名称
 * @param currentNodesIds 当前活跃节点ID数组
 * @param processConfig 流程配置JSON字符串或对象
 * @returns 当前节点名称
 */
function getCurrentNodeName(currentNodesIds: string[] | undefined, processConfig: any): string {
    if (!currentNodesIds || currentNodesIds.length === 0) {
        return '结束节点'
    }

    try {
        // 解析processConfig
        const config = typeof processConfig === 'string' ? JSON.parse(processConfig) : processConfig
        const nodes = config?.nodes || []

        // 根据currentNodesIds中的第一个ID查找节点
        const currentNodeId = currentNodesIds[0]
        const currentNode = nodes.find((node: any) => node.id === currentNodeId)

        if (currentNode && currentNode.name) {
            return currentNode.name
        }

        return '结束节点'
    } catch (error) {
        return '结束节点'
    }
}

// 根据sequenceFlows构建节点树
function buildNodeTree(currentNode: any, allNodes: any[], sequenceFlows: any[]) {
    // console.log('buildNodeTree: 开始构建节点', currentNode.id, currentNode.type, 'name:', currentNode.name)

    // 查找当前节点的输出连接线
    const outgoingFlows = sequenceFlows.filter(flow => flow.sourceRef === currentNode.id);
    // console.log('buildNodeTree: 节点', currentNode.id, '的输出连接数:', outgoingFlows.length, outgoingFlows)

    if (outgoingFlows.length === 0) {
        // 没有输出连接，说明是结束节点
        // console.log('buildNodeTree: 节点', currentNode.id, '没有输出连接，结束')
        return;
    }

    if (outgoingFlows.length === 1) {
        // 只有一个输出，设置childNode
        const nextNode = allNodes.find(node => node.id === outgoingFlows[0].targetRef);
        // console.log('buildNodeTree: 单个输出，下一个节点:', nextNode?.id, nextNode?.name)
        if (nextNode) {
            // 深拷贝并添加childNode
            currentNode.childNode = JSON.parse(JSON.stringify(nextNode));
            buildNodeTree(currentNode.childNode, allNodes, sequenceFlows);
        }
    } else {
        // 多个输出，说明是分支节点
        // 注意：根据图片，type 可能是 'BRANCH' 字符串
        const isBranchType = currentNode.type === 'BRANCH' || currentNode.type === 7 || currentNode.type === '7';
        // console.log('buildNodeTree: 多个输出，当前节点类型:', currentNode.type, 'isBranchType:', isBranchType)

        if (isBranchType) {
            // 如果是条件分支，需要设置conditionNodes
            if (!currentNode.conditionNodes) {
                currentNode.conditionNodes = [];
            }

            outgoingFlows.forEach((flow) => {
                const nextNode = allNodes.find(node => node.id === flow.targetRef);
                // console.log(`buildNodeTree: 分支输出[${index}]，下一个节点:`, nextNode?.id, nextNode?.name)
                if (nextNode) {
                    // 深拷贝下一个节点作为条件节点
                    const conditionNode = JSON.parse(JSON.stringify(nextNode));
                    // 确保条件节点的类型标记为7或BRANCH
                    if (conditionNode.type === 'BRANCH') {
                        conditionNode.type = 7;
                    }
                    currentNode.conditionNodes.push(conditionNode);
                    buildNodeTree(conditionNode, allNodes, sequenceFlows);
                }
            });
        } else {
            // 不是分支节点但有多个输出，设置为普通childNode（第一个）
            const nextNode = allNodes.find(node => node.id === outgoingFlows[0].targetRef);
            // console.log('buildNodeTree: 非BRANCH节点多个输出，取第一个:', nextNode?.id, nextNode?.name)
            if (nextNode) {
                currentNode.childNode = JSON.parse(JSON.stringify(nextNode));
                buildNodeTree(currentNode.childNode, allNodes, sequenceFlows);
            }
        }
    }
}
export { getCurrentNodeName, buildNodeTree }
