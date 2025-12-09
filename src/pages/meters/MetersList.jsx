// ============================================
// FILE: src/pages/meters/MetersList.jsx (Enhanced)
// ============================================
import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMeterStore } from '@/store'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Badge from '@/components/common/Badge'
import Input from '@/components/common/Input'
import { Plus, Search, MapPin, User, Gauge, AlertTriangle, CheckCircle, XCircle, Download } from 'lucide-react'
import { formatDateTime, formatMeterStatus, getStatusColor } from '@/utils/formatters'

// Sample meter images - replace with your actual CDN URLs
const meterImages = [
  'https://d64gsuwffb70l.cloudfront.net/68f0e80e08197953cfdc2e9c_1760618603114_8a5cb888.webp',
  'https://d64gsuwffb70l.cloudfront.net/68f0e80e08197953cfdc2e9c_1760618604844_ec18c4d0.webp',
  'https://d64gsuwffb70l.cloudfront.net/68f0e80e08197953cfdc2e9c_1760618606906_44c233ef.webp',
  'https://d64gsuwffb70l.cloudfront.net/68f0e80e08197953cfdc2e9c_1760618608902_fa0101e0.webp',
];

const statusConfig = {
  active: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle, label: 'Active' },
  suspended: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertTriangle, label: 'Suspended' },
  tamper: { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle, label: 'Tamper' },
  fault: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Fault' },
  offline: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: XCircle, label: 'Offline' },
};

const MeterCard = ({ meter, imageUrl, onClick }) => {
  const StatusIcon = statusConfig[meter.status]?.icon || CheckCircle;
  const statusStyle = statusConfig[meter.status] || statusConfig.active;
  
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:border-primary-300 transition-all duration-300 cursor-pointer group"
    >
      {imageUrl && (
        <div className="relative h-48 overflow-hidden bg-slate-100">
          <img 
            src={imageUrl} 
            alt={meter.meter_id} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          />
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border backdrop-blur-sm ${statusStyle.color}`}>
              <StatusIcon size={14} />
              {statusStyle.label}
            </span>
          </div>
        </div>
      )}
      <div className="p-5">
        <div className="mb-4">
          <h3 className="font-bold text-lg text-slate-900 mb-1">{meter.meter_id}</h3>
          <p className="text-sm text-slate-500 flex items-center gap-1.5">
            <MapPin size={14} className="text-slate-400" /> 
            {meter.location}
          </p>
        </div>
        
        <div className="space-y-3 text-sm border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 flex items-center gap-2">
              <Gauge size={14} className="text-slate-400" />
              Type
            </span>
            <span className="font-medium text-slate-900">{meter.meter_type}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Created</span>
            <span className="font-medium text-slate-900 text-xs">
              {formatDateTime(meter.created_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetersList = () => {
  const navigate = useNavigate()
  const { meters, isLoading, fetchMeters } = useMeterStore()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)

  useEffect(() => {
    fetchMeters()
  }, [fetchMeters])

  // Reset to first page when search / filter changes
  useEffect(() => {
    setPage(1)
  }, [search, statusFilter, pageSize])

  // Filter meters (search + status)
  const filteredMeters = useMemo(() => {
    const q = search.toLowerCase()

    return (meters || []).filter((meter) => {
      const matchSearch =
        meter.meter_id?.toLowerCase().includes(q) ||
        meter.location?.toLowerCase().includes(q)

      const matchStatus = !statusFilter || meter.status === statusFilter

      return matchSearch && matchStatus
    })
  }, [meters, search, statusFilter])

  // Pagination calculations
  const totalItems = filteredMeters.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const currentPage = Math.min(page, totalPages)

  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const pagedMeters = filteredMeters.slice(startIndex, endIndex)

  const handlePrev = () => {
    setPage((prev) => Math.max(1, prev - 1))
  }

  const handleNext = () => {
    setPage((prev) => Math.min(totalPages, prev + 1))
  }

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting meters data...')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Meter Management</h1>
          <p className="text-slate-600 mt-2">
            {totalItems} meter{totalItems !== 1 ? 's' : ''} found
            {totalItems > 0 && ` • Showing ${startIndex + 1}-${Math.min(endIndex, totalItems)}`}
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download size={18} />
            Export
          </Button>
          <Button 
            onClick={() => navigate('/meters/new')} 
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            Add Meter
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="flex-1">
            <Input
              placeholder="Search by meter ID or location..."
              icon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-slate-700 min-w-[160px]"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="tamper">Tamper</option>
            <option value="fault">Fault</option>
            <option value="offline">Offline</option>
          </select>
          
          {/* Page size selector */}
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="whitespace-nowrap">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-slate-700"
            >
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </div>
          
          {/* View toggle buttons */}
          <div className="flex gap-2 border border-slate-300 rounded-lg p-1 bg-slate-50">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="text-slate-600 mt-4">Loading meters...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredMeters.length === 0 && (
        <Card className="text-center py-12">
          <Gauge size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No meters found</h3>
          <p className="text-slate-600 mb-6">
            {search || statusFilter 
              ? 'Try adjusting your search or filters' 
              : 'Get started by adding your first meter'}
          </p>
          {!search && !statusFilter && (
            <Button onClick={() => navigate('/meters/new')}>
              <Plus size={18} className="mr-2" />
              Add Meter
            </Button>
          )}
        </Card>
      )}

      {/* Grid View */}
      {!isLoading && pagedMeters.length > 0 && viewMode === 'grid' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pagedMeters.map((meter, idx) => (
              <MeterCard
                key={meter.id}
                meter={meter}
                imageUrl={meterImages[idx % meterImages.length]}
                onClick={() => navigate(`/meters/${meter.id}`)}
              />
            ))}
          </div>

          {/* Pagination for Grid View */}
          {totalPages > 1 && (
            <Card className="mt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-3 py-4 px-6">
                <div className="text-sm text-slate-600">
                  Page <span className="font-semibold">{currentPage}</span> of{' '}
                  <span className="font-semibold">{totalPages}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrev}
                    disabled={currentPage <= 1}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      currentPage <= 1
                        ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentPage >= totalPages}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      currentPage >= totalPages
                        ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {/* List View (Table) */}
      {!isLoading && pagedMeters.length > 0 && viewMode === 'list' && (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Meter ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {pagedMeters.map((meter) => {
                    const statusStyle = statusConfig[meter.status] || statusConfig.active;
                    const StatusIcon = statusStyle.icon;
                    
                    return (
                      <tr 
                        key={meter.id}
                        onClick={() => navigate(`/meters/${meter.id}`)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-900">{meter.meter_id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-700">{meter.location}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-700">{meter.meter_type}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyle.color}`}>
                            <StatusIcon size={12} />
                            {statusStyle.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">
                            {formatDateTime(meter.created_at)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination for List View */}
          {totalPages > 1 && (
            <Card className="mt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-3 py-4 px-6">
                <div className="text-sm text-slate-600">
                  Showing{' '}
                  <span className="font-semibold">
                    {startIndex + 1}-{Math.min(endIndex, totalItems)}
                  </span>{' '}
                  of <span className="font-semibold">{totalItems}</span> meters
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrev}
                    disabled={currentPage <= 1}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      currentPage <= 1
                        ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-slate-600">
                    Page <span className="font-semibold">{currentPage}</span> of{' '}
                    <span className="font-semibold">{totalPages}</span>
                  </span>
                  <button
                    onClick={handleNext}
                    disabled={currentPage >= totalPages}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      currentPage >= totalPages
                        ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

export default MetersList