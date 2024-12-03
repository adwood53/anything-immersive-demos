// ControlButtons.js
'use client';

function ControlButtons() {
  const handleZoom = (delta) => {
    const control =
      document.getElementById('model-container')?.components[
        'model-control'
      ];
    if (control) control.updatePosition(delta);
  };

  const handleReset = () => {
    const control =
      document.getElementById('model-container')?.components[
        'model-control'
      ];
    if (control) control.resetModel();
  };

  return (
    <div className="control-buttons">
      <button className="control-btn" onClick={() => handleZoom(0.1)}>
        −
      </button>
      <button className="control-btn reset-btn" onClick={handleReset}>
        RESET
      </button>
      <button
        className="control-btn"
        onClick={() => handleZoom(-0.1)}
      >
        +
      </button>
      <style jsx>{`
        .control-buttons {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          display: flex;
          gap: 10px;
          touch-action: none;
        }

        .control-btn {
          appearance: none;
          background: rgba(0, 0, 0, 0.9);
          color: white;
          border: none;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          font-size: 28px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          padding: 0;
          touch-action: none;
          user-select: none;
          transition: transform 0.1s, background-color 0.1s;
        }

        .control-btn:active {
          transform: scale(0.95);
          background: rgba(0, 0, 0, 0.7);
        }

        .control-btn:hover {
          background: rgba(0, 0, 0, 0.8);
        }

        .reset-btn {
          font-size: 18px;
          width: 80px;
          border-radius: 30px;
        }
      `}</style>
    </div>
  );
}

export default ControlButtons;
