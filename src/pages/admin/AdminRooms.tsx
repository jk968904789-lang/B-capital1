import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, BedDouble, Search, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Room, RoomCategory } from '@/types';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/types';
import { formatEtb } from '@/lib/format';
import { PageTitle, EmptyState, Modal, ConfirmDialog, Toast } from '@/components/ui';

const DEFAULT_AMENITIES = [
  'Free Wi-Fi', 'Air Conditioning', 'Smart TV', 'En-suite Bathroom', 'Work Desk',
  'Daily Housekeeping', 'In-room Safe', 'King Bed', 'Minibar', 'City View',
  'Coffee Maker', 'Bathrobe & Slippers', 'Premium Toiletries', 'Nespresso Machine',
  'Living Area', 'Dining Area', 'Luxury Bathroom', 'Soaking Tub', 'Private Entrance',
];

const DEFAULT_IMAGE = 'https://images.pexels.com/photos/6434592/pexels-photo-6434592.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

interface RoomForm {
  name: string;
  category: RoomCategory;
  description: string;
  price: string;
  capacity: string;
  size_sqm: string;
  room_number: string;
  floor: string;
  amenities: string[];
  image_urls: string[];
  is_available: boolean;
}

const emptyForm: RoomForm = {
  name: '', category: 'standard', description: '', price: '', capacity: '2',
  size_sqm: '', room_number: '', floor: '', amenities: [], image_urls: [], is_available: true,
};

export default function AdminRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<RoomCategory | 'all'>('all');
  const [editing, setEditing] = useState<Room | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<RoomForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const load = () => {
    setLoading(true);
    supabase
      .from('rooms')
      .select('*')
      .order('category', { ascending: true })
      .order('price', { ascending: true })
      .then(({ data }) => {
        setRooms(data ?? []);
        setLoading(false);
      });
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 2800); };

  const filtered = rooms.filter((r) => {
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    if (query && !r.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (room: Room) => {
    setEditing(room);
    setForm({
      name: room.name,
      category: room.category,
      description: room.description,
      price: String(room.price),
      capacity: String(room.capacity),
      size_sqm: room.size_sqm ? String(room.size_sqm) : '',
      room_number: room.room_number ?? '',
      floor: room.floor ? String(room.floor) : '',
      amenities: room.amenities,
      image_urls: room.image_urls,
      is_available: room.is_available,
    });
    setShowForm(true);
  };

  const toggleAmenity = (a: string) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));
  };

  const addImageUrl = (url: string) => {
    if (!url.trim()) return;
    setForm((f) => ({ ...f, image_urls: [...f.image_urls, url.trim()] }));
  };

  const removeImageUrl = (idx: number) => {
    setForm((f) => ({ ...f, image_urls: f.image_urls.filter((_, i) => i !== idx) }));
  };

  const handleSave = async () => {
    if (!form.name || !form.description || !form.price) {
      showToast('Please fill in all required fields.');
      return;
    }
    if (Number(form.price) <= 0 || isNaN(Number(form.price))) {
      showToast('Price must be a positive number.');
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      category: form.category,
      description: form.description,
      price: Number(form.price),
      capacity: Number(form.capacity) || 2,
      size_sqm: form.size_sqm ? Number(form.size_sqm) : null,
      room_number: form.room_number || null,
      floor: form.floor ? Number(form.floor) : null,
      amenities: form.amenities,
      image_urls: form.image_urls.length ? form.image_urls : [DEFAULT_IMAGE],
      is_available: form.is_available,
    };

    if (editing) {
      const { error } = await supabase.from('rooms').update(payload).eq('id', editing.id);
      if (error) {
        showToast(error.message, 'error');
        setSaving(false);
        return;
      }
      showToast('Room updated successfully.');
    } else {
      const { error } = await supabase.from('rooms').insert(payload);
      if (error) {
        showToast(error.message, 'error');
        setSaving(false);
        return;
      }
      showToast('Room created successfully.');
    }
    setSaving(false);
    setShowForm(false);
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from('rooms').delete().eq('id', deleteTarget.id);
    if (error) {
      showToast(error.message.includes('restrict') ? 'Cannot delete a room with existing bookings.' : error.message);
    } else {
      showToast('Room deleted.');
    }
    load();
  };

  const toggleAvailability = async (room: Room) => {
    await supabase.from('rooms').update({ is_available: !room.is_available }).eq('id', room.id);
    load();
  };

  return (
    <div>
      <PageTitle
        title="Room Management"
        subtitle="Add, edit, and manage your hotel's rooms."
        action={
          <button onClick={openCreate} className="btn-gold">
            <Plus className="h-4 w-4" /> Add Room
          </button>
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row animate-fade-in">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search rooms…"
            className="input-luxe pl-10"
          />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as RoomCategory | 'all')} className="input-luxe sm:w-48">
          <option value="all">All Categories</option>
          {CATEGORY_ORDER.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
          <div className="divide-y divide-ink-50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-5 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="skeleton h-12 w-16 rounded-lg" />
                <div className="flex-1"><div className="skeleton h-4 w-32" /><div className="skeleton mt-2 h-3 w-24" /></div>
                <div className="skeleton h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={BedDouble} title="No rooms found" message="Add your first room to get started." action={<button onClick={openCreate} className="btn-gold"><Plus className="h-4 w-4" /> Add Room</button>} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-left text-xs uppercase tracking-widest text-ink-500">
              <tr>
                <th className="px-5 py-3">Room</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Capacity</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {filtered.map((room, i) => (
                <tr key={room.id} className="table-row-hover animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={room.image_urls[0] ?? DEFAULT_IMAGE} alt="" className="h-12 w-16 rounded object-cover" />
                      <div>
                        <p className="font-medium text-ink-900">{room.name}</p>
                        <p className="text-xs text-ink-400">{room.room_number ? `Room ${room.room_number}` : '—'}{room.floor ? ` · Floor ${room.floor}` : ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-gold-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-gold-700">
                      {CATEGORY_LABELS[room.category]}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-ink-900">{formatEtb(room.price)}</td>
                  <td className="px-5 py-3 text-ink-600">{room.capacity}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleAvailability(room)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors ${
                        room.is_available ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-ink-100 text-ink-500 hover:bg-ink-200'
                      }`}
                    >
                      {room.is_available ? 'Available' : 'Unavailable'}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(room)} className="rounded-lg p-2 text-ink-500 hover:bg-gold-50 hover:text-gold-600" aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(room)} className="rounded-lg p-2 text-ink-500 hover:bg-red-50 hover:text-red-600" aria-label="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Room form modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Room' : 'Add New Room'} size="xl">
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-luxe">Room Name *</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-luxe" placeholder="Deluxe 201" />
            </div>
            <div>
              <label className="label-luxe">Category *</label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as RoomCategory }))} className="input-luxe">
                {CATEGORY_ORDER.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label-luxe">Description *</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="input-luxe resize-none" placeholder="Describe the room…" />
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className="label-luxe">Price (ETB) *</label>
              <input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="input-luxe" placeholder="3500" />
            </div>
            <div>
              <label className="label-luxe">Capacity</label>
              <input type="number" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} className="input-luxe" placeholder="2" />
            </div>
            <div>
              <label className="label-luxe">Size (m²)</label>
              <input type="number" value={form.size_sqm} onChange={(e) => setForm((f) => ({ ...f, size_sqm: e.target.value }))} className="input-luxe" placeholder="24" />
            </div>
            <div>
              <label className="label-luxe">Floor</label>
              <input type="number" value={form.floor} onChange={(e) => setForm((f) => ({ ...f, floor: e.target.value }))} className="input-luxe" placeholder="1" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <label className="label-luxe">Room Number</label>
              <input value={form.room_number} onChange={(e) => setForm((f) => ({ ...f, room_number: e.target.value }))} className="input-luxe" placeholder="201" />
            </div>
            <div className="flex items-end pb-1 sm:col-span-2">
              <label className="flex items-center gap-3 text-sm text-ink-700">
                <input type="checkbox" checked={form.is_available} onChange={(e) => setForm((f) => ({ ...f, is_available: e.target.checked }))} className="h-4 w-4 rounded border-ink-300 text-gold-500 focus:ring-gold-400" />
                Available for booking
              </label>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="label-luxe">Amenities</label>
            <div className="flex flex-wrap gap-2 rounded-lg border border-ink-200 p-3">
              {DEFAULT_AMENITIES.map((a) => {
                const active = form.amenities.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      active ? 'bg-ink-950 text-white' : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
                    }`}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Images */}
          <ImageEditor urls={form.image_urls} onAdd={addImageUrl} onRemove={removeImageUrl} />

          <div className="flex justify-end gap-3 border-t border-ink-100 pt-5">
            <button onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-gold">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {editing ? 'Save Changes' : 'Create Room'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Room"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone. Rooms with existing bookings cannot be deleted.`}
        confirmLabel="Delete"
        tone="danger"
      />

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}

function ImageEditor({ urls, onAdd, onRemove }: { urls: string[]; onAdd: (url: string) => void; onRemove: (idx: number) => void }) {
  const [url, setUrl] = useState('');
  return (
    <div>
      <label className="label-luxe">Room Images</label>
      <div className="flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAdd(url); setUrl(''); } }}
          className="input-luxe"
          placeholder="Paste image URL…"
        />
        <button type="button" onClick={() => { onAdd(url); setUrl(''); }} className="btn-outline shrink-0">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
      {urls.length === 0 ? (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-ink-50 p-4 text-sm text-ink-400">
          <ImageIcon className="h-4 w-4" /> No images yet. A default image will be used.
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {urls.map((u, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-ink-200">
              <img src={u} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-ink-950/80 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove image"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
