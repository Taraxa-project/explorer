import React, { useState, useEffect, useCallback, useRef } from 'react';
import { connect } from 'react-redux'

import BlockPreview from "./BlockPreview"
import DagController from "./DagController"
import DagLegend from "./DagLegend"
import * as events from "./events"
import * as dag_events from "./dag_events"
import * as dag_draw from "./dag_draw"

let levelNodesPosition = {}

function DAG({recentDagBlocks, recentPbftBlocks, history, highlight}) {

    const [data] = useState(null)// Currently requested data
    const [prevData] = useState(null)//Last requested data

    const [cy, setCy] = useState(null)//The initialized DAG graph is used for binding events; it will not be updated after initialization to prevent related binding events such as websocket from being triggered multiple times。
    const dagCy = useRef(null) //Current latest DAG graph

	const canvas = useRef(null)

    const [startLevel, setStartLevel] = useState(s => { return 0 }) //DAG chart start level
    const [cyChange, setCyChange] = useState(false) // Whether the DAG diagram is updated
    const [blockPreview, setBlockPreview] = useState(null)

    const counter = useRef(0) // block number
    const lastOrderX = useRef(0)
    const lastDagX = useRef(0)
    const pauseNextAnimation = useRef(false)
	const firstLevel = useRef(0)

    const period = useRef(0) // current period
    const level = useRef(0) // current level
    const prevPeriodLastHash = useRef(null) // last hash of last period
    const isFirstBlock = useRef(true) // record first block to pan graph position

    // DagController event
    let onLeft = useCallback(() => {
        cy.panBy({ x: -20 })
    }, [cy])
    let onRight = useCallback(() => {
        cy.panBy({ x: 20 })
    }, [cy])
    let onUp = useCallback(() => {
        cy.panBy({ y: -20 })
    }, [cy])
    let onDown = useCallback(() => {
        cy.panBy({ y: 20 })
    }, [cy])
    let onMiddle = useCallback(() => {
        // cy.pan({ x: cy.width() / 2, y: cy.height() / 2 })

		let adjustment = cy.width()

		if (cy.width() > 1200) {
			adjustment -= (cy.width() - 1200) / 2
		} else {
			adjustment -= 100
		}

		cy.pan({
			x: -lastOrderX.current + adjustment,
			y: 0
		})

    }, [cy])

    // Mouse event
    let onBlockPreview = useCallback((ele, x, y) => {
        setBlockPreview(() => {
            return ele.data('type') === "dag" ?
                <BlockPreview
                    type={ele.data('type')}
                    x={x}
                    y={y}
                    level={ele.data('level')}
                    period={ele.data('period') === 0 ? 'Unfinalized' : ele.data('period')}
                    hash={ele.data('id')}
                /> : <BlockPreview
                    type={ele.data('type')}
                    x={x}
                    y={y}
                    number={ele.data('number')}
                    hash={ele.data('id').slice(0, ele.data('id').length - 6)}
                />

        }
        )
    }, [])
    let onMouseover = useCallback((event) => {
        events.onMouseover(event, onBlockPreview, dagCy)
    }, [onBlockPreview])

    let onMouseout = useCallback((event) => {
        events.onMouseout(event, setBlockPreview, dagCy)
    }, [])

    let onClick = useCallback(events.onClick, [])

    let onPan = useCallback(() => {
        //console.log('move')
    }, [])

    // Key event
    let onKeydown = useCallback((event) => {
        if (cy != null) {
            events.onKeydown(event, level.current, startLevel, setStartLevel, cy)
        }
        // eslint-disable-next-line
    }, [level.current, cyChange])

    // Websocket event
    let onBlock = useCallback((block) => {
        dag_events.onBlock(history, block, level, firstLevel, lastDagX, isFirstBlock, cy, dagCy, canvas, levelNodesPosition, highlight)
    }, [cy, history, highlight])

    let onFinalized = useCallback((dt) => {
        dag_events.onFinalized(history, dt, lastOrderX, lastDagX, period, level, cy, pauseNextAnimation, highlight)
    }, [cy, history, highlight])

    let onSchedule = useCallback((dt) => {
        dag_events.onSchedule(history, dt, prevPeriodLastHash, pauseNextAnimation, lastOrderX, lastDagX, counter, cy, canvas, highlight)
    }, [cy, history, highlight])


    useEffect(() => {
        dag_draw.draw(level, data, prevData, cyChange, setCyChange, setCy, dagCy, canvas)
        // eslint-disable-next-line
    }, [data, prevData])

    useEffect(() => {
        dagCy.current.on('click', '*', onClick);
        dagCy.current.on('mouseover', '*', onMouseover);
        dagCy.current.on('mouseout', '*', onMouseout);
        dagCy.current.on('pan', onPan)
        // eslint-disable-next-line
    }, [dagCy])

    useEffect(() => {
        document.onkeydown = onKeydown
    }, [onKeydown])

    useEffect(() => {
        if (cy) {
            cy.remove('node')
            levelNodesPosition = {}
            firstLevel.current = 0
            const r = [].concat(recentDagBlocks);
            r.reverse();
            for (const block of r) {
                block.hash = block._id;
                onBlock(block)
            }
            for (const block of r) {
                if (block.period && block.period !== -1) {
                    console.log(block.period)
                    onFinalized({
                        block: block._id,
                        period: block.period
                    })
                }
            }
        }
            
        // eslint-disable-next-line
    }, [cy, recentDagBlocks])


    return (
        <div className="dag box wide">

            {/* <DagController
                onLeft={onLeft}
                onRight={onRight}
                onMiddle={onMiddle}
                onUp={onUp}
                onDown={onDown}
            /> */}

            {blockPreview}

            {/* <DagLegend /> */}

            <div className="dag-levels-label">Dag Levels</div>
            <div id="dag-graph" className="dag-graph"></div>
            <div className="dag-periods-label">DAG Periods</div>

            

        </div>
    )

}

const mapStateToProps = (state) => {
    return {
      recentBlocks: state.blocks.recent,
      recentDagBlocks: state.dagBlocks.recent,
      recentPbftBlocks: state.pbftBlocks.recent
    }
  }
  
  export default connect(mapStateToProps)(DAG)
