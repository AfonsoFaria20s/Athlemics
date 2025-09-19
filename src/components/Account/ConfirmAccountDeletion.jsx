import React, { useState, useEffect } from 'react';

const ConfirmAccountDeletion = ({ open, onClose, onConfirm }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!open) {
      setPassword('');
      setLoading(false);
      setError('');
      setSuccess('');
    }
  }, [open]);

  if (!open) return null;

  const handleConfirm = async () => {
    setError('');
    setSuccess('');
    if (!password) {
      setError('Por favor insere a password para confirmar.');
      return;
    }
    setLoading(true);
    try {
      const res = await onConfirm(password);
      if (res?.ok) {
        setSuccess(res.message || 'Conta eliminada com sucesso.');
        setTimeout(() => {
          setPassword('');
          setLoading(false);
          onClose();
        }, 900);
      } else {
        setError(res?.message || 'Erro ao eliminar a conta.');
        setLoading(false);
      }
    } catch (e) {
      setError(e?.message || 'Erro inesperado.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-3 text-gray-400 hover:text-red-500 text-xl">×</button>
        <h3 className="text-xl font-bold mb-2 text-red-600">Confirmar Eliminação da Conta</h3>
        <p className="text-sm text-gray-600 mb-4">
          Esta ação remove permanentemente a tua conta e os dados associados. Por favor confirma com a tua password.
        </p>

        <input
          type="password"
          placeholder="Password para confirmar"
          className="w-full mb-3 p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-2">{success}</p>}

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? "A eliminar..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmAccountDeletion;
