'use client';
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../utils/apiClient';
import { X, Loader2, Plus, Trash2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewOrderModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const { data: customers } = useQuery({
    queryKey: ['customers', 'all'],
    queryFn: () => apiClient.get('/customers').then((res) => res.data.data),
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      customerId: '', // Ideally a searchable select drop-down
      targetDate: '',
      priority: 'NORMAL',
      description: '',
      items: [
        {
          itemName: 'Jewellery Name',
          category: 'RING',
          metal: 'GOLD',
          purity: '22K',
          expectedWeight: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return apiClient.post('/custom-orders', {
        ...data,
        items: data.items.map((i: any) => ({
          ...i,
          expectedWeight: Number(i.expectedWeight),
        })),
      });
    },
    onSuccess: () => {
      toast.success('Custom Order Draft Generated!');
      queryClient.invalidateQueries({ queryKey: ['custom-orders'] });
      onClose();
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || 'Error creating custom order'),
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
          maxWidth: 800,
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
          <h2 style={{ margin: 0, fontSize: '18px' }}>Create Custom Order Request</h2>
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
          <div
            style={{
              background: 'var(--bg-primary)',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
            }}
          >
            <h3
              className="text-muted flex justify-between"
              style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                marginBottom: '16px',
                fontWeight: 'bold',
              }}
            >
              1. Customer & Target
              <span className="text-primary flex items-center gap-1 cursor-pointer">
                <UserPlus size={14} /> Quick Add Customer
              </span>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: 'span 2' }}>
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
                  {...register('customerId', { required: 'Customer required' })}
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
                  Target Delivery Date
                </label>
                <input
                  type="date"
                  {...register('targetDate', { required: true })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-primary)',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3
                className="text-muted"
                style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold' }}
              >
                2. Requested Artefacts
              </h3>
              <button
                type="button"
                onClick={() =>
                  append({
                    itemName: '',
                    category: 'RING',
                    metal: 'GOLD',
                    purity: '22K',
                    expectedWeight: 0,
                  })
                }
                className="text-primary text-xs font-bold flex items-center gap-1"
              >
                <Plus size={12} /> Add Artefact
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 1fr 1fr 1fr 0.5fr auto',
                    gap: '8px',
                    alignItems: 'end',
                    background: 'white',
                    padding: '12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      Descriptive Item Name
                    </label>
                    <input
                      {...register(`items.${index}.itemName` as const)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        fontSize: '12px',
                      }}
                      placeholder="e.g. Diamond Engagement Ring"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Category</label>
                    <select
                      {...register(`items.${index}.category` as const)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        fontSize: '12px',
                      }}
                    >
                      <option value="RING">Ring</option>
                      <option value="NECKLACE">Necklace</option>
                      <option value="BANGLE">Bangle</option>
                      <option value="CHAIN">Chain</option>
                      <option value="EARRINGS">Earrings</option>
                      <option value="CUSTOM">Custom Abstract</option>
                    </select>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      gridColumn: 'span 2',
                    }}
                  >
                    <div>
                      <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        Metal / Purity
                      </label>
                      <input
                        {...register(`items.${index}.metal` as const)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          fontSize: '12px',
                        }}
                        placeholder="GOLD"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        Est. Weight(g)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.expectedWeight` as const)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          fontSize: '12px',
                        }}
                      />
                    </div>
                  </div>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                      style={{ alignSelf: 'flex-end', marginBottom: '2px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
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
              Global Design Notes / Constraints
            </label>
            <textarea
              {...register('description')}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                outline: 'none',
              }}
              rows={2}
              placeholder="Customer specific requests..."
            />
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
                'Create Custom Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
