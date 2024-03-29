import React from 'react';

const DagLegend = () => {
  return (
    <div className="dag-graph-legend box">
      <div className="dag-graph-legend-item box">
        <div className="box dag-graph-legend-item-icon dag-unfinalized"></div>
        <div className="box dag-graph-legend-item-text">Unfinalized DAG Block</div>
      </div>

      <div className="dag-graph-legend-item box">
        <div className="box dag-graph-legend-item-icon dag-1"></div>
        <div className="box dag-graph-legend-item-icon dag-2"></div>
        <div className="box dag-graph-legend-item-text">Finalized DAG Block</div>
      </div>

      <div className="dag-graph-legend-item box">
        <div className="box dag-graph-legend-item-icon dag-period"></div>
        <div className="box dag-graph-legend-item-text">Period DAG Block</div>
      </div>

      <div className="dag-graph-legend-item box">
        <div className="box dag-graph-legend-item-icon pivot"></div>
        <div className="box dag-graph-legend-item-text">Pivot</div>
      </div>

      <div className="dag-graph-legend-item box">
        <div className="box dag-graph-legend-item-icon tip"></div>
        <div className="box dag-graph-legend-item-text">Tip</div>
      </div>

      <div className="dag-graph-legend-item box">
        <div className="box dag-graph-legend-item-icon order-block"></div>
        <div className="box dag-graph-legend-item-text">Chain Block</div>
      </div>
    </div>
  );
};

export default DagLegend;
