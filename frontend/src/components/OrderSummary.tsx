'use client';

import { useState } from 'react';
import { Network } from '@/app/page';
import { Box, Heading, Text, Button, ButtonText, VStack, HStack, Center, Input, InputField } from '@/components/ui';
import { ArrowLeft, Shield, CreditCard, CheckCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { paymentService } from '@/lib/payment-service';
import { DataPlan } from '@/types/data-plan';

interface OrderSummaryProps {
  network: Network;
  dataPlan: DataPlan;
  phoneNumber: string;
  onConfirm: () => void;
  onBack: () => void;
}

export default function OrderSummary({ 
  network, 
  dataPlan, 
  phoneNumber, 
  onConfirm, 
  onBack 
}: OrderSummaryProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const formatPhoneNumber = (phone: string) => {
    if (phone.length === 11 && phone.startsWith('0')) {
      return phone.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
    }
    return phone;
  };

  const handleProceedToPayment = async () => {
    if (!customerName.trim() || !customerEmail.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!customerEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create transaction
      const transaction = await paymentService.createTransaction({
        phone_number: phoneNumber,
        network: network,
        data_plan_id: dataPlan.id,
        data_plan_name: dataPlan.plan_name,
        amount: parseFloat(dataPlan.price.toString())
      });

      // Initialize payment
      const paymentInit = await paymentService.initializePayment({
        transaction_id: transaction.id,
        customer_email: customerEmail.trim(),
        customer_name: customerName.trim()
      });

      // Redirect to payment gateway
      paymentService.redirectToPayment(paymentInit.payment_url);
      
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      setError(error.message || 'Failed to initialize payment. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <Box className="p-6 sm:p-8">
      <VStack space="lg">
        {/* Simple Header */}
        <Button onPress={onBack} variant="outline" size="sm" className="self-start">
          <ArrowLeft size={16} />
          <ButtonText className="ml-2">Back</ButtonText>
        </Button>
        
        <VStack space="xs">
          <Heading size="lg" className="text-typography-900 dark:text-typography-50">
            Order Summary
          </Heading>
          <Text className="text-typography-600 dark:text-typography-400">
            Review your order details
          </Text>
        </VStack>

        {/* Simple Order Card */}
        <Center>
          <VStack space="lg" className="max-w-md w-full">
            <Box className="bg-white dark:bg-background-900 rounded-xl border border-outline-200 dark:border-outline-700 p-6">
              <VStack space="md">
                {/* Plan & Price */}
                <Center>
                  <VStack space="xs">
                    <Text className="text-2xl font-bold text-typography-900 dark:text-typography-100">
                      {dataPlan?.data_amount}
                    </Text>
                    <Text className="text-xl font-bold text-primary-600 dark:text-primary-400">
                      ₦{parseFloat(dataPlan?.price.toString()).toLocaleString()}
                    </Text>
                  </VStack>
                </Center>

                <Box className="border-t border-outline-200 dark:border-outline-600"></Box>

                {/* Details */}
                <VStack space="sm">
                  <HStack className="justify-between">
                    <Text className="text-typography-600 dark:text-typography-400">Network</Text>
                    <Text className="font-medium text-typography-900 dark:text-typography-100">
                      {network.toUpperCase()}
                    </Text>
                  </HStack>
                  
                  <HStack className="justify-between">
                    <Text className="text-typography-600 dark:text-typography-400">Phone</Text>
                    <Text className="font-medium text-typography-900 dark:text-typography-100 font-mono">
                      {formatPhoneNumber(phoneNumber)}
                    </Text>
                  </HStack>
                  
                  <HStack className="justify-between">
                    <Text className="text-typography-600 dark:text-typography-400">Validity</Text>
                    <Text className="font-medium text-typography-900 dark:text-typography-100">
                      {dataPlan?.validity}
                    </Text>
                  </HStack>
                </VStack>
              </VStack>
            </Box>

            {/* Payment Form */}
            {!showPaymentForm ? (
              <VStack space="sm" className="w-full">
                <Button 
                  variant="solid" 
                  action="primary" 
                  size="lg"
                  onPress={() => setShowPaymentForm(true)}
                  className="w-full rounded-xl h-14"
                >
                  <ButtonText className="font-semibold">Proceed to Payment</ButtonText>
                </Button>
                
                <Button 
                  variant="outline" 
                  action="secondary" 
                  size="md"
                  onPress={onBack}
                  className="w-full rounded-xl"
                >
                  <ButtonText>Edit Order</ButtonText>
                </Button>
              </VStack>
            ) : (
              <VStack space="lg" className="w-full">
                {/* Customer Information Form */}
                <VStack space="sm">
                  <Text className="font-medium text-typography-900 dark:text-typography-100">
                    Customer Information
                  </Text>
                  
                  <VStack space="sm">
                    <Input variant="outline" size="md" className="rounded-xl">
                      <InputField
                        placeholder="Full Name"
                        value={customerName}
                        onChangeText={setCustomerName}
                        editable={!isProcessing}
                      />
                    </Input>
                    
                    <Input variant="outline" size="md" className="rounded-xl">
                      <InputField
                        placeholder="Email Address"
                        value={customerEmail}
                        onChangeText={setCustomerEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!isProcessing}
                      />
                    </Input>
                  </VStack>
                </VStack>

                {/* Error Message */}
                {error && (
                  <HStack space="sm" className="p-4 rounded-xl bg-error-50 dark:bg-error-900/20">
                    <AlertTriangle className="text-error-500 flex-shrink-0 mt-0.5" size={16} />
                    <Text className="text-error-700 dark:text-error-300 text-sm leading-relaxed">
                      {error}
                    </Text>
                  </HStack>
                )}

                {/* Payment Actions */}
                <VStack space="sm" className="w-full">
                  <Button 
                    variant="solid" 
                    action="positive" 
                    size="lg"
                    onPress={handleProceedToPayment}
                    isDisabled={isProcessing || !customerName.trim() || !customerEmail.trim()}
                    className="w-full rounded-xl h-14"
                  >
                    {isProcessing ? (
                      <HStack space="sm">
                        <Loader2 size={20} className="animate-spin" />
                        <ButtonText className="font-semibold">Processing...</ButtonText>
                      </HStack>
                    ) : (
                      <HStack space="sm">
                        <Shield size={20} />
                        <ButtonText className="font-semibold">Pay ₦{parseFloat(dataPlan?.price.toString()).toLocaleString()}</ButtonText>
                      </HStack>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    action="secondary" 
                    size="md"
                    onPress={() => {
                      setShowPaymentForm(false);
                      setError(null);
                    }}
                    isDisabled={isProcessing}
                    className="w-full rounded-xl"
                  >
                    <ButtonText>Back to Summary</ButtonText>
                  </Button>
                </VStack>

                {/* Security Notice */}
                <Box className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                  <HStack space="sm">
                    <Shield size={16} className="text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                    <Text className="text-primary-700 dark:text-primary-300 text-xs leading-relaxed">
                      Secured by ErcasPay. Your payment information is encrypted and protected.
                    </Text>
                  </HStack>
                </Box>
              </VStack>
            )}
          </VStack>
        </Center>
      </VStack>
    </Box>
  );
}