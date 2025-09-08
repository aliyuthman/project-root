'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Box, Heading, Text, Button, ButtonText, VStack, HStack, Center } from '@/components/ui';
import { CheckCircle, XCircle, Clock, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import { paymentService, TransactionStatus } from '@/lib/payment-service';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'processing'>('loading');
  const [transaction, setTransaction] = useState<TransactionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const reference = searchParams.get('reference');
  const transactionId = searchParams.get('transaction_id');

  useEffect(() => {
    if (!reference && !transactionId) {
      setStatus('failed');
      setError('Invalid payment callback - missing reference');
      return;
    }

    checkPaymentStatus();
  }, [reference, transactionId]);

  const checkPaymentStatus = async () => {
    try {
      // For now, we'll try to extract transaction ID from reference
      // or use provided transaction_id
      let txnId = transactionId;
      if (!txnId && reference) {
        // Extract transaction ID from reference pattern: PAY_{transaction_id}_{timestamp}
        const match = reference.match(/PAY_([^_]+)_/);
        if (match) {
          txnId = match[1];
        }
      }

      if (!txnId) {
        throw new Error('Could not determine transaction ID');
      }

      const txnStatus = await paymentService.getTransactionStatus(txnId);
      setTransaction(txnStatus);

      switch (txnStatus.status) {
        case 'completed':
          setStatus('success');
          break;
        case 'payment_failed':
        case 'failed':
          setStatus('failed');
          break;
        case 'payment_completed':
        case 'processing':
          setStatus('processing');
          // Continue checking status for processing transactions
          setTimeout(checkPaymentStatus, 5000);
          break;
        default:
          setStatus('processing');
          setTimeout(checkPaymentStatus, 3000);
      }
    } catch (error: any) {
      console.error('Error checking payment status:', error);
      setError(error.message || 'Failed to check payment status');
      setStatus('failed');
    }
  };

  const handleRetry = () => {
    setStatus('loading');
    setError(null);
    checkPaymentStatus();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle size={64} className="text-success-500" />;
      case 'failed':
        return <XCircle size={64} className="text-error-500" />;
      case 'processing':
        return <Clock size={64} className="text-warning-500" />;
      default:
        return <Loader2 size={64} className="text-primary-500 animate-spin" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'success':
        return 'Payment Successful!';
      case 'failed':
        return 'Payment Failed';
      case 'processing':
        return 'Processing Your Data...';
      default:
        return 'Checking Payment Status...';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'success':
        return `Your ${transaction?.data_plan_name} data has been successfully delivered to ${transaction?.phone_number}`;
      case 'failed':
        return error || 'Your payment could not be processed. Please try again or contact support.';
      case 'processing':
        return `We're delivering your ${transaction?.data_plan_name} data to ${transaction?.phone_number}. This usually takes a few minutes.`;
      default:
        return 'Please wait while we verify your payment...';
    }
  };

  return (
    <Box className="min-h-screen bg-background-0">
      <Box className="flex flex-col min-h-screen">
        {/* Header */}
        <Box className="border-b border-outline-200 dark:border-outline-700 bg-white dark:bg-background-900">
          <Box className="mx-auto px-4 py-4 sm:px-6 max-w-4xl">
            <Center>
              <HStack space="md">
                <Center className="w-8 h-8 rounded-lg bg-primary-500">
                  <Text className="text-white font-bold text-sm">D</Text>
                </Center>
                <Heading size="lg" className="text-typography-900 dark:text-typography-50 font-semibold">
                  DataPurchase NG
                </Heading>
              </HStack>
            </Center>
          </Box>
        </Box>

        {/* Main Content */}
        <Box className="flex-1 px-4 py-8 sm:px-6 max-w-2xl mx-auto w-full">
          <Center>
            <VStack space="lg" className="max-w-md w-full">
              <Box className="bg-white dark:bg-background-900 rounded-xl border border-outline-200 dark:border-outline-700 p-8">
                <VStack space="lg">
                  {/* Status Icon */}
                  <Center>
                    {getStatusIcon()}
                  </Center>

                  {/* Status Title */}
                  <Center>
                    <Heading size="lg" className="text-typography-900 dark:text-typography-50 text-center">
                      {getStatusTitle()}
                    </Heading>
                  </Center>

                  {/* Status Message */}
                  <Center>
                    <Text className="text-typography-600 dark:text-typography-400 text-center leading-relaxed">
                      {getStatusMessage()}
                    </Text>
                  </Center>

                  {/* Transaction Details */}
                  {transaction && (
                    <Box className="w-full p-4 bg-background-50 dark:bg-background-800 rounded-xl">
                      <VStack space="sm">
                        <HStack className="justify-between">
                          <Text className="text-typography-600 dark:text-typography-400 text-sm">Network</Text>
                          <Text className="font-medium text-typography-900 dark:text-typography-100 text-sm">
                            {transaction.network.toUpperCase()}
                          </Text>
                        </HStack>
                        
                        <HStack className="justify-between">
                          <Text className="text-typography-600 dark:text-typography-400 text-sm">Phone</Text>
                          <Text className="font-medium text-typography-900 dark:text-typography-100 text-sm font-mono">
                            {transaction.phone_number}
                          </Text>
                        </HStack>
                        
                        <HStack className="justify-between">
                          <Text className="text-typography-600 dark:text-typography-400 text-sm">Amount</Text>
                          <Text className="font-medium text-typography-900 dark:text-typography-100 text-sm">
                            ₦{parseFloat(transaction.amount).toLocaleString()}
                          </Text>
                        </HStack>

                        {transaction.provider_reference && (
                          <HStack className="justify-between">
                            <Text className="text-typography-600 dark:text-typography-400 text-sm">Reference</Text>
                            <Text className="font-medium text-typography-900 dark:text-typography-100 text-sm font-mono">
                              {transaction.provider_reference}
                            </Text>
                          </HStack>
                        )}
                      </VStack>
                    </Box>
                  )}

                  {/* Actions */}
                  <VStack space="sm" className="w-full">
                    {status === 'loading' || status === 'processing' ? (
                      <Button 
                        variant="outline" 
                        size="md"
                        onPress={handleRetry}
                        className="w-full rounded-xl"
                      >
                        <HStack space="sm">
                          <RefreshCw size={16} />
                          <ButtonText>Refresh Status</ButtonText>
                        </HStack>
                      </Button>
                    ) : (
                      <Button 
                        variant="solid" 
                        action="primary" 
                        size="lg"
                        onPress={handleGoHome}
                        className="w-full rounded-xl h-14"
                      >
                        <HStack space="sm">
                          <ArrowLeft size={20} />
                          <ButtonText className="font-semibold">Buy More Data</ButtonText>
                        </HStack>
                      </Button>
                    )}
                  </VStack>
                </VStack>
              </Box>
            </VStack>
          </Center>
        </Box>

        {/* Footer */}
        <Box className="border-t border-outline-200 dark:border-outline-700 bg-white dark:bg-background-900">
          <Box className="mx-auto px-4 py-3 max-w-4xl">
            <Center>
              <HStack space="md" className="text-center">
                <Text size="xs" className="text-typography-500">
                  © 2025 DataPurchase NG
                </Text>
                <Box className="w-1 h-1 bg-typography-400 rounded-full"></Box>
                <Text size="xs" className="text-typography-500">
                  Secure & Fast
                </Text>
              </HStack>
            </Center>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function PaymentCallback() {
  return (
    <Suspense fallback={
      <Box className="min-h-screen bg-background-0 flex items-center justify-center">
        <Center>
          <VStack space="md">
            <Loader2 size={48} className="animate-spin text-primary-500" />
            <Text className="text-typography-600">Loading payment status...</Text>
          </VStack>
        </Center>
      </Box>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}