'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../utils/apiClient';
import { X, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewRepairModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();

  const { data: customers } = useQuery({
    queryKey: ['customers', 'all'],
    queryFn: () => apiClient.get('/customers').then((res) => res.data.data),
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      customerId: '',
      productType: '',
      productDetails: '',
      repairType: 'Cleaning',
      estimatedCost: 0,
      advancePaid: 0,
      priority: 'NORMAL',
      estimatedDate: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: any) =>
      apiClient.post('/repairs', {
        ...data,
        issueDescription: data.productDetails,
        estimatedCost: Number(data.estimatedCost),
        advancePaid: Number(data.advancePaid),
      }),
    onSuccess: () => {
      toast.success('Repair Job generated successfully!');
      queryClient.invalidateQueries({ queryKey: ['repairs-list'] });
      queryClient.invalidateQueries({ queryKey: ['repairs', 'dashboard'] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error processing request');
    },
  });

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(30,30,30,0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !mutation.isPending) onClose();
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 750,
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '0',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            background: 'var(--primary)',
            color: 'white',
            borderRadius: '16px 16px 0 0',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px' }}>Create Repair Job</h2>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit((d) => mutation.mutate(d))}
          style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}
        >
          {/* SECTION 1 */}
          <div
            style={{
              background: 'var(--bg-primary)',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
            }}
          >
            <h3
              className="text-muted"
              style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                marginBottom: '16px',
                fontWeight: 'bold',
              }}
            >
              1. Customer & Priority
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                  }}
                >
                  Select Customer *
                </label>
                <select
                  {...register('customerId', { required: 'Customer is required' })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    outline: 'none',
                  }}
                >
                  <option value="">-- Choose existing customer --</option>
                  {customers?.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.mobile})
                    </option>
                  ))}
                </select>
                {errors.customerId && (
                  <span style={{ color: 'var(--danger)', fontSize: '12px' }}>
                    {errors.customerId.message as string}
                  </span>
                )}
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                  }}
                >
                  Priority Level
                </label>
                <select
                  {...register('priority')}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    outline: 'none',
                  }}
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2 */}
          <div
            style={{
              background: 'var(--bg-primary)',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
            }}
          >
            <h3
              className="text-muted"
              style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                marginBottom: '16px',
                fontWeight: 'bold',
              }}
            >
              2. Jewellery & Repair Task
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    marginBottom: '4px',
                    color: 'var(--text-muted)',
                  }}
                >
                  Item Type (Ring, Chain, etc) *
                </label>
                <input
                  {...register('productType', { required: true })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                  }}
                  placeholder="e.g. Gold Necklace"
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    marginBottom: '4px',
                    color: 'var(--text-muted)',
                  }}
                >
                  Repair Required *
                </label>
                <select
                  {...register('repairType')}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <option value="Cleaning">Cleaning & Polishing</option>
                  <option value="Resize">Ring Resizing</option>
                  <option value="Soldering">Chain Soldering</option>
                  <option value="Stone Setting">Stone Setting</option>
                  <option value="Plating">Rhodium/Gold Plating</option>
                  <option value="Custom">Custom Mod</option>
                </select>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    marginBottom: '4px',
                    color: 'var(--text-muted)',
                  }}
                >
                  Issue Description / Details *
                </label>
                <textarea
                  {...register('productDetails', { required: true })}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                  }}
                  placeholder="Clearly describe the damage or required work..."
                />
              </div>
            </div>
          </div>

          {/* SECTION 3 */}
          <div
            style={{
              background: 'var(--bg-primary)',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
            }}
          >
            <h3
              className="text-muted"
              style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                marginBottom: '16px',
                fontWeight: 'bold',
              }}
            >
              3. Cost Estimation & Delivery
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    marginBottom: '4px',
                    color: 'var(--text-muted)',
                  }}
                >
                  Est Cost (₹)
                </label>
                <input
                  type="number"
                  step="1"
                  {...register('estimatedCost')}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    marginBottom: '4px',
                    color: 'var(--text-muted)',
                  }}
                >
                  Adv Paid (₹)
                </label>
                <input
                  type="number"
                  step="1"
                  {...register('advancePaid')}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    marginBottom: '4px',
                    color: 'var(--text-muted)',
                  }}
                >
                  Estimated Delivery
                </label>
                <input
                  type="date"
                  {...register('estimatedDate')}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                  }}
                />
              </div>
            </div>
          </div>

          <div
            style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}
          >
            <button
              type="button"
              onClick={onClose}
              className="btn"
              style={{ background: 'white', border: '1px solid var(--border-color)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn btn-primary"
              style={{ minWidth: '180px' }}
            >
              {mutation.isPending ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  Generate Job Card <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
