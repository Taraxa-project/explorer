import React, { useState, useEffect, useCallback, useRef } from 'react';
import BlockPreview from "./BlockPreview"
import DagController from "./DagController"
import DagLegend from "./DagLegend"
import * as events from "./events"
import * as dag_events from "./dag_events"
import * as dag_draw from "./dag_draw"

let levelNodesPosition = {}

function DAG(props) {

	const isStart = useRef(true)
	const refresh = useRef(0)

    const [data] = useState(null)// 当前请求的数据
    const [prevData] = useState(null)//上一次请求的数据

    const [cy, setCy] = useState(null)//初始化的DAG图，用于绑定事件；初始化以后不会再更新，防止相关绑定事件比如websocket多次触发。
    const dagCy = useRef(null) //当前最新的DAG图

	const canvas = useRef(null)

    const [startLevel, setStartLevel] = useState(s => { return 0 }) //DAG图开始level
    const [cyChange, setCyChange] = useState(false) // DAG图是否更新
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
        dag_events.onBlock(props.history, block, level, firstLevel, lastDagX, isFirstBlock, cy, dagCy, canvas, levelNodesPosition, props.highlight)
    }, [cy, props.history, props.highlight])

    let onFinalized = useCallback((dt) => {
        dag_events.onFinalized(props.history, dt, lastOrderX, lastDagX, period, level, cy, pauseNextAnimation, props.highlight)
    }, [cy, props.history, props.highlight])

    let onSchedule = useCallback((dt) => {
        dag_events.onSchedule(props.history, dt, prevPeriodLastHash, pauseNextAnimation, lastOrderX, lastDagX, counter, cy, canvas, props.highlight)
    }, [cy, props.history, props.highlight])


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

        console.log('Loading data')

		let refreshTime = props.reload

		if (!refreshTime)
			refreshTime = 0

        if (cy && (refreshTime === 0 || refreshTime > refresh.current) ) {

            console.log('Doing data refresh', props.history, isStart.current, props.empty)

			refresh.current = refreshTime

            cy.remove('node')
            levelNodesPosition = {}
			firstLevel.current = 0

            if (props.history) {

				// cy.reset()
				if (isStart.current) {

					isStart.current = false

					if (!props.empty)
                		getBlockHistory(props.filter, onBlock, onFinalized, onSchedule, onMiddle, props.highlight)

				} else {

					getBlockHistory(props.filter, onBlock, onFinalized, onSchedule, onMiddle, props.highlight)
				}

            } else {
                console.log('Use recentDagBlocks', props.recentDagBlocks)
            }
        }
        // eslint-disable-next-line
    }, [cy, props.reload, props.history, props.highlight])


    return (
        <div className="dag box wide">

            <DagController
                onLeft={onLeft}
                onRight={onRight}
                onMiddle={onMiddle}
                onUp={onUp}
                onDown={onDown}
            />

            {blockPreview}

            <div id="dag-graph" className="dag-graph"></div>

            <DagLegend />

            <div className="dag-levels-label">Levels</div>
			<div className="dag-periods-label">Periods</div>


        </div>
    )

}

export default DAG
