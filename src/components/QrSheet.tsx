import { QRCodeSVG } from 'qrcode.react';
import type { Group } from '../../shared/types';
import { submitUrl } from '../lib/api';

interface Props {
  groups: Group[];
}

export function QrSheet({ groups }: Props) {
  return (
    <div className="qr-sheet">
      <div className="qr-sheet-header screen-only">
        <h2>QR sheet</h2>
        <p>Print this page to hand out group QR codes.</p>
        <button type="button" className="btn primary" onClick={() => window.print()}>
          Print QR sheet
        </button>
      </div>

      <div className="qr-grid">
        {groups.map((group) => {
          const url = submitUrl(group.token);
          return (
            <article key={group.id} className="qr-card">
              <QRCodeSVG value={url} size={140} level="M" includeMargin />
              <h3>{group.name}</h3>
              <p className="qr-url">{url}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
