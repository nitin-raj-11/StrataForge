interface Trade {
  id: number;
  entryDate: string;
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  pnlPercent: number;
}

interface TradeTableProps {
  trades: Trade[];
}

function TradeTable({
  trades,
}: TradeTableProps) {
  return (
    <div className="trade-table-wrapper">
      <table className="trade-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Entry Date</th>
            <th>Exit Date</th>
            <th>Entry Price</th>
            <th>Exit Price</th>
            <th>P&L</th>
            <th>Return</th>
          </tr>
        </thead>

        <tbody>
          {trades.map((trade) => (
            <tr key={trade.id}>
              <td>{trade.id}</td>

              <td>{trade.entryDate}</td>

              <td>{trade.exitDate}</td>

              <td>
                ${trade.entryPrice.toFixed(2)}
              </td>

              <td>
                ${trade.exitPrice.toFixed(2)}
              </td>

              <td
                className={
                  trade.pnl >= 0
                    ? "profit"
                    : "loss"
                }
              >
                {trade.pnl >= 0 ? "+" : ""}
                ${trade.pnl.toFixed(2)}
              </td>

              <td
                className={
                  trade.pnlPercent >= 0
                    ? "profit"
                    : "loss"
                }
              >
                {trade.pnlPercent >= 0
                  ? "+"
                  : ""}
                {trade.pnlPercent.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TradeTable;