import * as config from "./config";
import * as color from "./color";

export let onClick = (event) => {
    var ele = event.target
    if (ele.isNode()) {
        let id = ele.data('id')
        if (ele.data('type') === "dag") {
            window.open('/dag/block/' + id)
        } else {
            id = id.slice(0, id.length - 6)
            window.open('/block/' + id)
        }
    }
}

export let onKeydown = (event, level, startLevel, setStartLevel, cy) => {
    if (event && (event.keyCode === 38 || event.keyCode === 39)) {
        level = level + 1
        if (level > startLevel + config.LevelRange - 6) {
            setStartLevel(startLevel + config.LevelRange)
        } else {
            cy.nodes('[label="' + level.toString() + '"]').style('background-color', color.NodeColor)
            cy.nodes('[label = "' + (level + 1).toString() + '"]').style('background-color', color.SelectColor)
            cy.pan({ x: cy.width() / 2 - level * 50 })
        }

    }
    if (event && (event.keyCode === 40 || event.keyCode === 37)) {
        if (level - 1 >= 0) {
            level = level - 1
            if (level < startLevel + 6) {
                setStartLevel(startLevel - config.LevelRange)
            } else {
                cy.nodes('[label="' + level.toString() + '"]').style('background-color', color.NodeColor)
                cy.nodes('[label = "' + (level - 1).toString() + '"]').style('background-color', color.SelectColor)
                cy.pan({ x: cy.width() / 2 - level * 50 })
            }
        }

    }
}

export let onMouseover = (event, onBlockPreview, dagCy) => {

    var ele = event.target

    let x = event.renderedPosition.x + 20
    let y = event.renderedPosition.y
    if (x + 300 > window.innerWidth)
        x = window.innerWidth - 350
    if (y > 250)
        y = 250

    if (ele.isNode()) {

        ele.attr('background-color', ele.style('background-color'))
        ele.attr('color', ele.style('color'))
        ele.style('background-color', 'yellow')
        ele.style('color', 'black')

        onBlockPreview(ele, x, y)

        if (dagCy) {

			let period = ele.data('period')

            if (ele.data('type') === 'dag') {

				let node_order = dagCy.current.elements('node[id="' + ele.data('id') + '_order"]').select()
                node_order.attr('background-color', node_order.style('background-color'))
                node_order.attr('color', node_order.style('color'))

				node_order.style({
                    'color': 'black',
                    'background-color': 'yellow'
                })

            } else {

				let node = dagCy.current.elements('node[id="' + ele.data('id').substring(0, ele.data('id').indexOf('_order')) + '"]').select()

				node.attr('background-color', node.style('background-color'))
                node.attr('color', node.style('color'))
                node.style({
                    'color': 'black',
                    'background-color': 'yellow'
                })
            }

			if (period !== 0) {

				// highilight nodes in the same period
				dagCy.current.elements('node').forEach((ele) => {

					if (ele.data('period') === period) {

						ele.attr('border-color', ele.style('border-color'))

						ele.style({
							'border-color': 'yellow'
						})
					}
				})

				// highilight edges in the same period
				dagCy.current.elements('edge').forEach((ele) => {

					if (ele.data('period') === period) {

						ele.style({
							'line-color': 'yellow',
							'source-arrow-color': 'yellow'
						})
					}
				})
			}
        }

    } else {
        // ele.style('color', 'yellow');
        // ele.style('text-valign', 'bottom');
        // ele.style('label', ele.data('type') + ':' + ele.data('id'));
    }

}

export let onMouseout = (event, setBlockPreview, dagCy) => {

    var ele = event.target

	if (ele.isNode()) {

        ele.style('background-color', ele.attr('background-color'))
        ele.style('color', ele.attr('color'))

        setBlockPreview(null)

        if (dagCy) {

            if (ele.data('type') === 'dag') {

				var node_order = dagCy.current.elements('node[id="' + ele.data('id') + '_order"]').select()

				node_order.style({
                    'color': node_order.attr('color'),
                    'background-color': node_order.attr('background-color')
                })

            } else {

                let node = dagCy.current.elements('node[id="' + ele.data('id').substring(0, ele.data('id').indexOf('_order')) + '"]').select()

				node.style({
                    'color': node.attr('color'),
                    'background-color': node.attr('background-color')
                })
            }

			dagCy.current.elements('node').forEach((ele) => {

				ele.style({
					'border-color': ele.attr('border-color')
				})
			})

			dagCy.current.elements('edge').style({
				'line-color': color.PivotColor,
				'source-arrow-color': color.PivotColor
			})
        }

    } else {
        // ele.style('text-valign', 'center');
        // ele.style('label', "");
    }
}
