import * as config from "./config"
import * as color from "./color"
import { drawLables } from "./dag_draw"

export function getNextNodeY(yRange, nodeHeight, levelNodes) {

    let y = levelNodes.lastNodeY - nodeHeight - Math.round((Math.random() * 50))

    levelNodes.lastNodeY = y

    return y
}

export function block2node(block, levelNodesPosition) {

    var level = block["level"].toString()
    // var n = level.length

    let yRange = 300
    let nodeHeight = 30

    let y = Math.round(100 * Math.random() + 200)

    if (!levelNodesPosition[level]) {

        levelNodesPosition[level] = {
            'lastNodeY': y,
            'total': 1
        }

    } else {

        y = getNextNodeY(yRange, nodeHeight, levelNodesPosition[level])

        levelNodesPosition[level].total++
    }

    return {
        "group": "nodes",
        "data": {
            "id": block["hash"],
            "label": '', //n < 3 ? 'L' + level : 'L' + level.substring(n - 2), //only show last two char
            "level": parseInt(block["level"]),
            "type": "dag",
            "period": 0
        },
        "position": { x: config.LevelWidth * parseInt(block["level"]), y }  // String(block["hash"]).slice(0, 5).to_i(16)// //y: parseInt(String(block["timestamp"]).slice(-2))
    }
}

export function pivot2edge(block) {
    if (block["pivot"] === `0000000000000000000000000000000000000000000000000000000000000000`) {
        return null
    }
    return {
        "group": "edges",
        "data": {
            "id": block["pivot"] + '>' + block["hash"],
            "label": block["pivot"] + '>' + block["hash"],
            "source": block["pivot"],
            "target": block["hash"],
            "directed": true,
            "type": "pivot"
        }
    }
}

export function tips2edge(block) {
    return block["tips"] ? block["tips"].map(hash => {
        return {
            "group": "edges",
            "data": {
                "id": hash + '>' + block["hash"],
                "label": hash + '>' + block["hash"],
                "source": hash,
                "target": block["hash"],
                "directed": true,
                "type": "tips"
            }
        }
    }
    ) : null
}

export let onBlock = (isHistory, block, level, firstLevel, lastDagX, isFirstBlock, cy, dagCy, canvas, levelNodesPosition, highlight) => {

    //if number is hex string , convert it to int
    if (typeof (block.level) === 'string') {
        block.level = parseInt(block.level)
    }

    if (typeof (block.timestamp) === 'string') {
        block.timestamp = parseInt(block.timestamp)
    }

    var node = block2node(block, levelNodesPosition)
    var pivot = pivot2edge(block)
    var tips = tips2edge(block)

    if (node != null) {

        try {

			cy.add(node)

		} catch (err) {
        }

		let cyNode = cy.elements('node[id="' + block.hash + '"]').select()

		cyNode.style({
			'background-color': highlight === block.hash ? color.NodeHoverColor : '',
			'color':  highlight === block.hash ? '#000' : ''
		})

    }

    if (pivot != null) {

		try {

            cy.add(pivot)

			cy.elements('edge[id="' + pivot.data.id + '"]').select().style({
	            "line-color": color.PivotColor,
	            'source-arrow-color': color.PivotColor,
	            'line-style': 'solid',
				'width': 1
	        })

        } catch (err) {

			// remove all nodes before the pivot break
			if (firstLevel.current !== 0 && block.level !== firstLevel.current) {
				let previousNodes = cy.elements('node[level < ' + block.level + ']').select()
				cy.remove(previousNodes)
			}
        }

    }

    if (tips != null) {
        try {
            cy.add(tips)
        }
        catch (err) {
        }
		tips.forEach((tip) => {
			cy.elements('edge[id="' + tip.data.id + '"]').select().style({
	            "line-color": color.TipsColor,
	            'source-arrow-color': color.TipsColor,
	            'line-style': 'dashed',
				'width': 1
	        })
		})
    }

    if (node != null && isFirstBlock.current) {
        cy.pan({ x: dagCy.current.width() / 2 - node.data.level * config.LevelWidth - 4 * config.LevelWidth})
        lastDagX.current = node.position.x
        isFirstBlock.current = false
    }

	if (firstLevel.current === 0)
		firstLevel.current = block.level

	lastDagX.current = node.position.x

    if (node.data.level > level.current) {

		level.current = node.data.level

		if (isHistory) {

			// Use cy.pan in onSchedule

		} else {

			cy.stop(false, true) //停止cy的未完成的动画，防止页面抖动
			let dpi = window.devicePixelRatio
			cy.animate({
	            panBy: { x: -80 } //只有level.current增大时才移动
	            // pan: { x: cy.width() / 2 - node.position.x }, //立即移动到当前位置
	        }, {
	            duration: config.Duration,
				queue: false
	        })
		}
    }
}


export let onFinalized = (isHistory, data, lastOrderX, lastDagX, period, level, cy, pauseNextAnimation, highlight) => {

    if (typeof (data.period) === 'string') {
        data.period = parseInt(data.period)
    }

    period.current = data.period

    var ele = cy.elements('node[id="' + data.block + '"]').select()
    ele.data('period', data.period)
    // ele.style('background-color', color.NodeFinalizedColor)
    ele.style('color', color.NodeFinalizedTextColor)

	if (highlight === data.block) {
		ele.style('background-color', color.NodeHoverColor)
	    ele.style('color', color.NodeHoverTextColor)
	}

    //change period dag block label
    ele.data('label', 'P')

    let leftShift = lastOrderX.current - lastDagX.current

    var nodes = cy.elements('[type="order"]').select()

    //nodes.shift({ x: -leftShift })

    if (!isHistory)
        pauseNextAnimation.current = true

    nodes.forEach((node) => {

        if (isHistory) {

            node.position('x', node.position('x') - leftShift)
            node.position('y', config.ChainBlockY)

        } else {
			// onFinalized - move order blocks
            node.animate({
                position: {
                    x: node.position('x') - leftShift,
                    y: config.ChainBlockY
                }
            }, {
				duration: config.Duration,
			 	queue: false
			})

        }
    })

    if (!isHistory) {

        setTimeout(() => {
            pauseNextAnimation.current = false
        }, config.Duration + 50)

        // Remove small period node
        // var p = period.current - config.RemainPeriod
        // nodes = cy.elements('node[period<="' + p + '"][period>0]').select()
        // cy.remove(nodes)

		// Remove small level nodes
		var p = level.current - config.RemainLevel
        nodes = cy.elements('node[level<="' + p + '"][level>0]').select()
        cy.remove(nodes)
    }
}

export let onSchedule = (isHistory, data, prevPeriodLastHash, pauseNextAnimation, lastOrderX, lastDagX, counter, cy, canvas, highlight) => {

    if (!isHistory && pauseNextAnimation.current) {
        setTimeout(() => onSchedule(isHistory, data, prevPeriodLastHash, pauseNextAnimation, lastOrderX, lastDagX, counter, cy), 500)
        return
    }

    var blocks = data.schedule.dag_blocks_order

    //if hex type number, convert it
    if (typeof (data.period) === 'string') {
        data.period = parseInt(data.period)
    }
    var first_number = data.period

    var N = blocks.length

    // move nodes at bottom to left
    let leftShift = N * 50

	var nodes = cy.elements('[type="order"]')
	// console.log('# of order nodes', nodes.length)

    nodes.forEach((node) => {

        if (isHistory) {

            node.position('x', node.position('x') - leftShift)
            node.position('y', config.ChainBlockY)

        } else {

			// onSchedule animation 1 - left shift order blocks
            node.animate({
                position: {
                    x: node.position('x') - leftShift,
                    y: config.ChainBlockY
                }
            }, {
				duration: config.Duration,
			 	queue: false
			})
        }
    })

    if (!isHistory)
        pauseNextAnimation.current = true

	lastOrderX.current = lastDagX.current
    lastOrderX.current -= leftShift


    let periodNode = cy.elements('node[id="' + blocks[blocks.length - 1] + '"]').select()
    let currentPeriod = periodNode.data('period')

	// copy DAG block and move it to order blocks
    blocks.forEach((hash, index) => {

		if (isHistory) {

			copyBlock(hash, index, counter, lastDagX, cy, currentPeriod, first_number, isHistory, blocks, lastOrderX, prevPeriodLastHash, N, highlight)

		} else {

	        setTimeout(() => {

	            copyBlock(hash, index, counter, lastDagX, cy, currentPeriod, first_number, isHistory, blocks, lastOrderX, prevPeriodLastHash, N, highlight)

	        }, config.Duration * (index + 1))
		}

		cy.elements('edge').forEach((ele) => {
			if (ele.data('target') === hash) {
				ele.data('period', currentPeriod)
			}
		})
    });

	if (isHistory) {

		// move the right bordr of DAG history graph to the right border of main screen area(1200px)
		let adjustment = cy.width()

		if (cy.width() > 1200) {
			adjustment -= (cy.width() - 1200) / 2
		} else {
			adjustment -= 100
		}

		cy.pan({ x: -lastOrderX.current + adjustment })

		// setTimeout(() => {
		//
		// 	var orderNodes = cy.elements('node[type="order"]').select()
		//
		// 	orderNodes.forEach(node => {
		// 		node.position('x', node.position('x') - (lastOrderX.current - lastDagX.current))
		// 	})
		// })

    } else  {

        setTimeout(() => {
            pauseNextAnimation.current = false
        }, config.Duration)
    }


	setTimeout(() => drawLables(cy, canvas))
}

let copyBlock = (hash, index, counter, lastDagX, cy, currentPeriod, first_number, isHistory, blocks, lastOrderX, prevPeriodLastHash, N, highlight) => {

	//counter.current += 1
	counter.current = first_number + index

	lastOrderX.current += 50

	var node_dag = cy.elements('node[id="' + hash + '"]').select()

	node_dag.data('period', currentPeriod)

	let isEvenPeriod = currentPeriod % 2 === 0 ? true : false

	if (isEvenPeriod) {
		setEvenPeriodNodeStyle(node_dag, highlight)
	} else {
		setOddPeriodNodeStyle(node_dag, highlight)
	}

	//复制节点
	var node_order_data = node_dag.json()

	if (node_order_data !== undefined) {

		node_order_data.data.id += '_order'
		node_order_data.data.type = 'order'
		node_order_data.data.period = currentPeriod
		node_order_data.data.number = counter.current
		node_order_data.data.label = counter.current.toString()

		try {

			cy.add(node_order_data)

			var node_order = cy.elements('node[id="' + hash + '_order"]').select()

			node_order.style({
				'background-color': highlight === hash ? color.NodeHoverColor : color.NodeOrderColor,
				'border-width': config.NodeBorderWidth,
				'border-color': highlight === hash ? color.NodeHoverColor : color.NodeOrderColor,
				'color':  highlight === hash ? '#000' : ''
			})

			if (isHistory) {

				node_order.position('x', lastOrderX.current)
				node_order.position('y', config.ChainBlockY)

			} else {

				// onSchedule animation 2 - move copied order block to bottom
				node_order.animate({
					position: {
						x: lastOrderX.current,
						y: config.ChainBlockY
					}
				}, {
					duration: config.Duration,
				 	queue: false
				})
			}

			if (index === blocks.length - 1) {

				lastOrderX.current = lastDagX.current
			}

			//prev_hash上一个order block的hash,prevPeriodLastHash上一周期的最后dag block的hash
			var prev_hash
			if (index === 0) {
				prev_hash = prevPeriodLastHash.current
			} else {
				prev_hash = blocks[index - 1]
			}
			//保留最后一个hash，用于下一个周期的连接
			if (index === N - 1) {
				prevPeriodLastHash.current = hash
			}

			var edge_id = hash + '_order>' + prev_hash + '_order'
			var edge_data = {
				"group": "edges",
				"data": {
					"id": edge_id,
					"label": edge_id,
					"target": hash + '_order',
					"source": prev_hash + '_order',
					"period": currentPeriod,
					"directed": true,
					"type": "order"
				}
			}
			if (prev_hash != null) {
				try {
					var edge = cy.add(edge_data)
					// var edge = cy.elements('edge[id="' + edge_id + '"]').select()
					edge.style({
						"line-color": color.OrderColor,
						'source-arrow-color': color.OrderColor,
						'line-style': 'solid'
					});
				}
				catch (err) {
					//console.log(err)
				}
			}


		} catch(err) {

			// duplicate nodes
			console.log(err)
		}

	}
}


let setEvenPeriodNodeStyle = (node_dag, highlight) => {

	if (highlight && highlight === node_dag.data('id')) {

		node_dag.style({
			'border-color': color.NodeHoverColor,
			'background-color': color.NodeHoverColor,
			'color': color.NodeHoverTextColor
		})

	} else {

	    if (node_dag.style('background-color') === 'rgb(255,255,255)') {

	        node_dag.style({
	            'border-color': color.NodeFinalizedEvenPeriodBorderColor,
	            'border-width': config.NodeBorderWidth,
	            'background-color': color.NodeFinalizedEvenPeriodColor,
	            'color': color.NodeFinalizedTextColor
	        })

	        node_dag.attr('color', color.NodeFinalizedEvenPeriodTextColor)
	        node_dag.attr('background-color', color.NodeFinalizedEvenPeriodColor)

	    } else {

	        node_dag.style({
	            'border-color': color.NodeEvenPeriodBorderColor,
	            'border-width': config.NodeBorderWidth,
	            'background-color': color.NodeEvenPeriodColor,
	            'color': color.NodeEvenPeriodTextColor
	        })

	        node_dag.attr('color', color.NodeEvenPeriodTextColor)
	        node_dag.attr('background-color', color.NodeEvenPeriodColor)
	    }
	}
}

let setOddPeriodNodeStyle = (node_dag, highlight) => {

	if (highlight && highlight === node_dag.data('id')) {

		node_dag.style({
			'border-color': color.NodeHoverColor,
			'background-color': color.NodeHoverColor,
			'color': color.NodeHoverTextColor
		})

	} else {

	    if (node_dag.style('background-color') === 'rgb(255,255,255)') {

	        node_dag.style({
	            'background-color': color.NodeFinalizedColor,
	            'color': color.NodeFinalizedEvenPeriodTextColor,
	            'border-color': color.NodeFinalizedBorderColor,
	            'border-width': config.NodeBorderWidth
	        })

	        node_dag.attr('color', color.NodeFinalizedTextColor)
	        node_dag.attr('background-color', color.NodeFinalizedColor)

	    } else {

	        node_dag.style({
	            'background-color': color.NodeColor,
	            'color': color.NodeTextColor,
	            'border-color': color.NodeBorderColor,
	            'border-width': config.NodeBorderWidth
	        })

	        node_dag.attr('color', color.NodeTextColor)
	        node_dag.attr('background-color', color.NodeColor)
	    }
	}
}
