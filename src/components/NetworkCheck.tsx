import { useNetworkCheck, type NetworkQuality } from '../hooks/useNetworkCheck'
import { StatusBadge } from './StatusBadge'

interface Props { step: number }

function formatSpeed(mbps: number): string {
  if (mbps >= 1000) return `${(mbps / 1000).toFixed(2)} Gbps`
  if (mbps >= 1)    return `${mbps.toFixed(1)} Mbps`
  return `${(mbps * 1000).toFixed(0)} Kbps`
}

const qualityLabel: Record<NetworkQuality, string> = {
  excellent: 'Excellent',
  good:      'Good',
  medium:    'Medium',
  poor:      'Poor',
}

// Map quality to the four StatusBadge statuses
const qualityStatus: Record<NetworkQuality, 'ok' | 'warning' | 'error'> = {
  excellent: 'ok',
  good:      'ok',
  medium:    'warning',
  poor:      'error',
}

export function NetworkCheck({ step }: Props) {
  const { status, result, error, run } = useNetworkCheck()

  const isTesting = status === 'testing'

  return (
    <section className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
      <div className="px-6 pt-5 pb-5 flex flex-col gap-4">

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 flex items-center justify-center size-11 rounded-xl bg-indigo-50 ring-1 ring-indigo-100">
            {isTesting ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="size-5 text-indigo-600 animate-spin" style={{ animationDuration: '1.2s' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="size-5 text-indigo-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0z" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">{step}</span>
              <h2 className="text-base font-semibold text-slate-900">Network</h2>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              {result && result.connectionType !== 'Unknown'
                ? `Connected via ${result.connectionType}`
                : 'Measure your download speed'}
            </p>
          </div>
        </div>

        {/* Status + action row */}
        <div className="flex items-center justify-between">
          {result ? (
            <StatusBadge
              status={qualityStatus[result.quality]}
              message={`${qualityLabel[result.quality]} — ${formatSpeed(result.speedMbps)}`}
            />
          ) : error ? (
            <StatusBadge status="error" message="Test failed" />
          ) : isTesting ? (
            <StatusBadge status="warning" message="Measuring speed..." />
          ) : (
            <StatusBadge status="idle" message="Not tested" />
          )}

          <button
            onClick={run}
            disabled={isTesting}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
              <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clipRule="evenodd" />
            </svg>
            {isTesting ? 'Testing...' : result ? 'Re-test' : 'Run Test'}
          </button>
        </div>

        {/* Speed breakdown */}
        {result && (
          <div className="grid grid-cols-3 gap-3 pt-1 border-t border-slate-100">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-slate-400 font-medium">Speed</span>
              <span className="text-sm font-semibold text-slate-800">{formatSpeed(result.speedMbps)}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-slate-400 font-medium">Quality</span>
              <span className="text-sm font-semibold text-slate-800">{qualityLabel[result.quality]}</span>
            </div>
            {result.connectionType !== 'Unknown' && (
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-slate-400 font-medium">Type</span>
                <span className="text-sm font-semibold text-slate-800">{result.connectionType}</span>
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{error}</p>
        )}

        {!result && !error && !isTesting && (
          <p className="text-xs text-slate-400">
            Downloads a 5 MB test file from Cloudflare to measure speed. No data is uploaded.
          </p>
        )}
      </div>
    </section>
  )
}
