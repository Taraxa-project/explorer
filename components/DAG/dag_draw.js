import * as color from './color';
import cytoscape from 'cytoscape';
import cyCanvas from 'cytoscape-canvas';

try {
  cyCanvas(cytoscape);
} catch (e) {
  // blah
}

export let draw = (level, data, prevData, cyChange, setCyChange, setCy, dagCy, canvas) => {
  var _data = data;

  if (prevData != null) {
    _data = data.concat(prevData);
  }

  dagCy.current = cytoscape({
    container: document.getElementById('dag-graph'), // container to render in
    autounselectify: true,
    hideEdgesOnViewport: false,
    elements: _data,
    style: [
      // node styles
      {
        selector: 'node',
        style: {
          'background-color': color.NodeUnfinalizedColor,
          color: color.NodeUnfinalizedTextColor,
          'border-color': color.NodeUnfinalizedBorderColor,
          'border-width': color.NodeUnfinalizedBorderWidth,
          label: 'data(label)',
          'text-valign': 'center',
          'font-family': 'Futura, "Source Sans Pro", Helvetica, "Trebuchet MS", sans-serif',
          'font-weight': 'normal',
          'font-size': '14px',
          shape: 'rectangle',
        },
      },
      // line styles
      {
        selector: 'edge',
        style: {
          width: 1,
          'curve-style': 'bezier',
          'source-arrow-color': color.TipsColor,
          'source-arrow-shape': 'triangle',
          'line-style': 'dashed',
          'line-color': color.TipsColor,
        },
      },
    ],
    layout: {
      name: 'preset',
      roots: '[id = "e406ed0517617de0246f138a47616fdc82fbb53a01f0886c87157fc295e20cf0"]',
      padding: 20,
      fit: false,
    },
    userPanningEnabled: false,
    userZoomingEnabled: false,
  });
  // dagCy.current.reset()
  // dagCy.current.zoom(2)
  dagCy.current.pan({ x: dagCy.current.width() - 80, y: 70 });
  // dagCy.current.pan({ x: 0, y: 70 });
  dagCy.current
    .nodes(`[label = "${level.current.toString()}"]`)
    .style('background-color', color.SelectColor);

  setCy(dagCy.current);
  setCyChange(!cyChange);

  canvas.current = dagCy.current.cyCanvas({
    zIndex: 0,
    pixelRatio: window.devicePixelRatio || 1,
  });

  document.getElementById('dag-graph').children[0].style['z-index'] = '1';

  dagCy.current.on('pan', () => {
    drawLables(dagCy.current, canvas);
  });
};

export let drawLables = (cy, canvas) => {
  if (canvas) {
    let levels = {};
    let periods = {};

    var cyCanvas = canvas.current.getCanvas();
    var ctx = cyCanvas.getContext('2d');

    let dpi = window.devicePixelRatio;

    let style = {
      height() {
        return +getComputedStyle(cyCanvas).getPropertyValue('height').slice(0, -2);
      },
      width() {
        return +getComputedStyle(cyCanvas).getPropertyValue('width').slice(0, -2);
      },
    };

    cyCanvas.setAttribute('width', style.width() * dpi);
    cyCanvas.setAttribute('height', style.height() * dpi);

    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.clearRect(0, 0, cyCanvas.width, cyCanvas.height);
    ctx.fillStyle = '#555';

    cy.elements('node[type="dag"]')
      .select()
      .forEach((node) => {
        if (!levels[node.data('level')]) {
          levels[node.data('level')] = true;

          if (node.data('level') % 2 === 0) {
            ctx.beginPath();
            ctx.strokeStyle = '#555';
            ctx.setLineDash([5, 5]);

            // ctx.moveTo(node.renderedPosition('x') - 40, 20)
            // ctx.lineTo(node.renderedPosition('x') + 40, 20)
            // ctx.stroke()

            ctx.moveTo(node.renderedPosition('x') - 40, 40);
            ctx.lineTo(node.renderedPosition('x') - 40, 390);
            ctx.stroke();

            ctx.moveTo(node.renderedPosition('x') + 40, 40);
            ctx.lineTo(node.renderedPosition('x') + 40, 390);
            ctx.stroke();

            ctx.fillStyle = '#555';
            ctx.font = '16px Futura';
            let textX = node.renderedPosition('x');
            textX -= (node.data('level').toString().length / 2) * 10;
            ctx.fillText(node.data('level'), textX, 40);

            ctx.closePath();
          } else {
            ctx.fillStyle = '#555';
            ctx.font = '16px Futura';
            let textX = node.renderedPosition('x');
            textX -= (node.data('level').toString().length / 2) * 10;
            ctx.fillText(node.data('level'), textX, 60);
          }
        }

        let period = node.data('period');
        let periodColor = period % 2 === 0 ? color.PeriodEvenLineColor : color.PeriodLineColor;
        let periodLineY = period % 2 === 0 ? 400 : 410;
        let periodTextY = period % 2 === 0 ? 395 : 430;

        if (period !== 0) {
          if (!periods[period]) {
            periods[period] = {
              x1: node.renderedPosition('x') - 30,
              y1: periodLineY,
            };
          } else {
            if (node.data('label') === 'P') {
              periods[period].x2 = node.renderedPosition('x') + 30;
              periods[period].y2 = periodLineY;
            }
          }

          if (node.data('label') === 'P') {
            ctx.beginPath();

            ctx.strokeStyle = periodColor;
            ctx.setLineDash([0, 0]);

            ctx.moveTo(periods[period].x1, periodLineY);
            ctx.lineTo(periods[period].x2, periodLineY);
            ctx.stroke();

            ctx.fillStyle = periodColor;
            ctx.font = '14px Futura';
            let textX = periods[period].x1 + (periods[period].x2 - periods[period].x1) / 2;
            textX -= (period.toString().length / 2) * 10;
            ctx.fillText(period, textX, periodTextY);

            ctx.closePath();
          }
        }
      });
  }
};
