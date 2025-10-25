'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function EtsyOAuthCallbackPage() {
  const t = useTranslations('etsy');
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      // Check for error from Etsy
      if (error) {
        setStatus('error');
        setMessage(t('oauth.error') || `Authorization failed: ${error}`);
        return;
      }

      // Check for authorization code
      if (!code) {
        setStatus('error');
        setMessage(t('oauth.noCode') || 'Missing authorization code');
        return;
      }

      try {
        // Get shop_id from localStorage or use default
        const shopId = localStorage.getItem('etsy_shop_id') || 'mrAnarchyStudioArt';
        
        // Get admin token
        const token = localStorage.getItem('adminToken');
        if (!token) {
          setStatus('error');
          setMessage('Authentication required. Please log in to admin panel.');
          setTimeout(() => {
            router.push('/admin/login');
          }, 2000);
          return;
        }

        // Exchange code for token via backend
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/etsy/oauth/callback?code=${code}&state=${state}&shop_id=${shopId}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (response.ok || response.redirected) {
          setStatus('success');
          setMessage(t('oauth.success') || 'Authorization successful! Redirecting...');
          
          // Redirect to etsy-sync page after 2 seconds
          setTimeout(() => {
            router.push('/admin/etsy-sync?auth=success');
          }, 2000);
        } else {
          const errorData = await response.text();
          setStatus('error');
          setMessage(t('oauth.exchangeFailed') || `Failed to exchange token: ${errorData}`);
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setStatus('error');
        setMessage(
          t('oauth.error') || 
          `An error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`
        );
      }
    };

    handleOAuthCallback();
  }, [searchParams, router, t]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
        {status === 'processing' && (
          <div className="text-center">
            <div className="mb-6">
              <i className="pi pi-spin pi-spinner text-6xl text-purple-600"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              {t('oauth.processing') || 'Processing Authorization...'}
            </h2>
            <p className="text-gray-600">
              {t('oauth.pleaseWait') || 'Please wait while we complete your Etsy authorization.'}
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <i className="pi pi-check text-4xl text-green-600"></i>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-3">
              {t('oauth.successTitle') || 'Authorization Successful!'}
            </h2>
            <p className="text-gray-600 mb-4">
              {message}
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <i className="pi pi-spin pi-spinner"></i>
              <span>{t('oauth.redirecting') || 'Redirecting to dashboard...'}</span>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <i className="pi pi-times text-4xl text-red-600"></i>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-3">
              {t('oauth.errorTitle') || 'Authorization Failed'}
            </h2>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <button
              onClick={() => router.push('/admin/etsy-sync')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {t('oauth.returnToDashboard') || 'Return to Dashboard'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
