'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { firestore as db } from '../../firebaseApp';

type BannerData = {
  message: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  link: string;
};

type Banner = {
  id: string;
  data: BannerData;
};

const emptyForm: BannerData = {
  message: '',
  is_active: true,
  start_date: '',
  end_date: '',
  link: '',
};

const Advertise = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [form, setForm] = useState<BannerData>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let fallbackUnsub: (() => void) | undefined;
    const q = query(collection(db, 'app_banners'), orderBy('created_at', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setBanners(
          snapshot.docs.map((d) => ({
            id: d.id,
            data: {
              message: String(d.data().message ?? ''),
              is_active: Boolean(d.data().is_active ?? true),
              start_date: String(d.data().start_date ?? ''),
              end_date: String(d.data().end_date ?? ''),
              link: String(d.data().link ?? ''),
            },
          })),
        );
      },
      () => {
        fallbackUnsub = onSnapshot(collection(db, 'app_banners'), (snapshot) => {
          setBanners(
            snapshot.docs.map((d) => ({
              id: d.id,
              data: {
                message: String(d.data().message ?? ''),
                is_active: Boolean(d.data().is_active ?? true),
                start_date: String(d.data().start_date ?? ''),
                end_date: String(d.data().end_date ?? ''),
                link: String(d.data().link ?? ''),
              },
            })),
          );
        });
      },
    );
    return () => {
      unsubscribe();
      fallbackUnsub?.();
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message.trim()) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'app_banners'), {
        ...form,
        message: form.message.trim(),
        created_at: serverTimestamp(),
      });
      setForm(emptyForm);
    } catch (error) {
      console.error('Error adding banner: ', error);
      alert('Error adding banner. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (banner: Banner) => {
    try {
      await updateDoc(doc(db, 'app_banners', banner.id), {
        is_active: !banner.data.is_active,
      });
    } catch (error) {
      console.error('Error updating banner: ', error);
    }
  };

  const removeBanner = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    try {
      await deleteDoc(doc(db, 'app_banners', id));
    } catch (error) {
      console.error('Error deleting banner: ', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="dashboard-card">
        <h3 className="mb-1 text-lg font-semibold sm:text-xl">App notice banner</h3>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Shown at the top of the mobile app and web store. Example:{' '}
          <span className="font-medium">&quot;20% discount till Fall&quot;</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="message" className="mb-1 block">
              Banner message
            </label>
            <input
              type="text"
              id="message"
              name="message"
              value={form.message}
              onChange={handleInputChange}
              placeholder="20% discount till Fall"
              className="dashboard-input w-full"
              required
            />
          </div>
          <div>
            <label htmlFor="link" className="mb-1 block">
              Optional link (URL)
            </label>
            <input
              type="url"
              id="link"
              name="link"
              value={form.link}
              onChange={handleInputChange}
              placeholder="https://..."
              className="dashboard-input w-full"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="start_date" className="mb-1 block">
                Start date (optional)
              </label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={form.start_date}
                onChange={handleInputChange}
                className="dashboard-input w-full"
              />
            </div>
            <div>
              <label htmlFor="end_date" className="mb-1 block">
                End date (optional)
              </label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={form.end_date}
                onChange={handleInputChange}
                className="dashboard-input w-full"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleInputChange}
            />
            Active immediately
          </label>
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-60"
          >
            {saving ? 'Publishing…' : 'Publish banner'}
          </button>
        </form>
      </div>

      <div className="dashboard-card">
        <h3 className="mb-4 text-lg font-semibold">Current banners</h3>
        {banners.length === 0 ? (
          <p className="text-sm text-gray-500">No banners yet.</p>
        ) : (
          <ul className="space-y-3">
            {banners.map((b) => (
              <li
                key={b.id}
                className="flex flex-col gap-2 rounded border border-gray-200 p-3 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="font-medium">{b.data.message}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    {b.data.is_active ? 'Active' : 'Inactive'}
                    {b.data.start_date || b.data.end_date
                      ? ` · ${b.data.start_date || '…'} → ${b.data.end_date || '…'}`
                      : ''}
                    {b.data.link ? ` · ${b.data.link}` : ''}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => toggleActive(b)}
                    className="rounded border px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {b.data.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeBanner(b.id)}
                    className="rounded border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Advertise;
