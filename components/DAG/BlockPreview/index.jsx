import React from 'react';

function BlockPreview(props) {
  let x = props.x;
  let y = props.y;

  return (
    <div className="block-preview" style={{ left: `${x}px`, top: `${y}px` }}>
      <div className="box block-preview-row">
        <div className="box right block-preview-row-name">Type</div>
        <div className="box fill block-preview-row-value">
          {`${props.type === 'dag' ? 'DAG' : 'PBFT'} Block`}
        </div>
      </div>

      {props.type === 'dag' ? (
        <div>
          <div className="box block-preview-row">
            <div className="box right block-preview-row-name">Level</div>
            <div className="box fill block-preview-row-value">{props.level}</div>
          </div>

          <div className="box block-preview-row">
            <div className="box right block-preview-row-name">Period</div>
            <div className="box fill block-preview-row-value">{props.period}</div>
          </div>
          <div className="box block-preview-row">
            <div className="box right block-preview-row-name">Hash</div>
            <div className="box fill block-preview-row-value">
              <a href={`/dag_block/${props.hash}`} target="_blank" rel="noopener noreferrer">
                {props.hash}
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {' '}
          <div className="box block-preview-row">
            <div className="box right block-preview-row-name">Number</div>
            <div className="box fill block-preview-row-value">{props.number}</div>
          </div>
          <div className="box block-preview-row">
            <div className="box right block-preview-row-name">Hash</div>
            <div className="box fill block-preview-row-value">{props.hash}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BlockPreview;
