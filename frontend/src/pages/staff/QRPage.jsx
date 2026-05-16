import { useState, useEffect, useRef } from 'react'
import { QrCode, Download, Printer } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import toast from 'react-hot-toast'

const TABLES = Array.from({ length: 20 }, (_, i) => i + 1)

export default function QRPage() {
  const [selectedTable, setSelectedTable] = useState(1)
  const [tableCount, setTableCount] = useState(10)
  const qrRef = useRef(null)

  // Use current window origin for QR codes so they always point to the correct live domain
  const getQRUrl = (tableNum) => `${window.location.origin}/menu?table=${tableNum}`

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const img = new Image()
    img.onload = () => {
      canvas.width = 300; canvas.height = 300
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, 300, 300)
      ctx.drawImage(img, 0, 0, 300, 300)
      const link = document.createElement('a')
      link.download = `QR_Meja_${selectedTable}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      toast.success(`QR Meja ${selectedTable} diunduh!`)
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  const printQR = () => window.print()

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">QR Code Meja</h1>
        <p className="text-sm text-gray-500">Generate dan download QR code untuk setiap meja</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* QR Generator */}
        <div className="card p-6 space-y-5">
          <div>
            <label className="label-text">Pilih Nomor Meja</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {TABLES.slice(0, tableCount).map(n => (
                <button
                  key={n}
                  onClick={() => setSelectedTable(n)}
                  className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${selectedTable === n ? 'bg-primary-800 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-primary-50 hover:text-primary-800'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label-text">Jumlah Meja</label>
            <input
              type="number" min="1" max="50" value={tableCount}
              onChange={e => setTableCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
              className="input-field"
            />
          </div>

          {/* QR Code display */}
          <div ref={qrRef} className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="bg-white p-4 rounded-2xl shadow-md">
              <QRCodeSVG
                value={getQRUrl(selectedTable)}
                size={200}
                level="H"
                includeMargin={true}
                fgColor="#2e7d32"
              />
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">Meja {selectedTable}</p>
              <p className="text-xs text-gray-500 mt-1 font-mono break-all">{getQRUrl(selectedTable)}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={downloadQR} className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm">
              <Download size={18} /> Download PNG
            </button>
            <button onClick={printQR} className="btn-secondary flex items-center gap-2 text-sm py-3 px-4">
              <Printer size={18} /> Print
            </button>
          </div>

          <div className="p-3 bg-primary-50 rounded-xl">
            <p className="text-xs text-primary-700 font-medium">
              💡 Scan QR ini akan membuka menu cafe dan mengisi nomor meja secara otomatis.
              Tempel QR di masing-masing meja.
            </p>
          </div>
        </div>

        {/* All tables preview */}
        <div className="card p-5">
          <h3 className="font-bold text-gray-800 mb-4">Semua QR Meja ({tableCount} meja)</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {TABLES.slice(0, tableCount).map(n => (
              <div
                key={n}
                onClick={() => setSelectedTable(n)}
                className={`cursor-pointer flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${selectedTable === n ? 'border-primary-600 bg-primary-50' : 'border-gray-100 hover:border-primary-300'}`}
              >
                <div className="bg-white p-1 rounded-lg shadow-sm">
                  <QRCodeSVG value={getQRUrl(n)} size={70} level="M" fgColor="#2e7d32" />
                </div>
                <p className="text-xs font-bold text-gray-700 mt-2">Meja {n}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
