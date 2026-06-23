import { QRCodeSVG } from 'qrcode.react';
import type { Group, Player } from '../../shared/types';
import { submitUrl } from '../lib/api';

interface Props {
  players: Player[];
  groups: Group[];
}

export function QrSheet({ players, groups }: Props) {
  const groupById = new Map(groups.map((group) => [group.id, group.name]));

  return (
    <div className="qr-sheet">
      <div className="qr-sheet-header screen-only">
        <h2>QR sheet</h2>
        <p>Print this page to hand out player QR codes.</p>
        <button type="button" className="btn primary" onClick={() => window.print()}>
          Print QR sheet
        </button>
      </div>

      <div className="qr-grid">
        {players.map((player) => {
          const url = submitUrl(player.token);
          return (
            <article key={player.id} className="qr-card">
              <QRCodeSVG value={url} size={140} level="M" includeMargin />
              <h3>{player.name}</h3>
              {player.groupId && <p>{groupById.get(player.groupId)}</p>}
              <p className="qr-url">{url}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
