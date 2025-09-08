'use client';

import { Network } from '@/app/page';
import { Box, Heading, Text, Button, ButtonText, VStack, Center } from '@/components/ui';

interface NetworkSelectionProps {
  onNetworkSelect: (network: Network) => void;
}

const networks = [
  { 
    id: 'mtn' as Network, 
    name: 'MTN'
  },
  { 
    id: 'airtel' as Network, 
    name: 'Airtel'
  },
  { 
    id: 'glo' as Network, 
    name: 'Glo'
  },
  { 
    id: '9mobile' as Network, 
    name: '9mobile'
  }
];

export default function NetworkSelection({ onNetworkSelect }: NetworkSelectionProps) {
  return (
    <Box className="p-6 sm:p-8">
      {/* Minimal Header */}
      <VStack space="xs" className="mb-8">
        <Heading size="lg" className="text-typography-900 dark:text-typography-50">
          Select Network
        </Heading>
        <Text className="text-typography-600 dark:text-typography-400">
          Choose your mobile network provider
        </Text>
      </VStack>

      {/* Clean Network List */}
      <Center>
        <VStack space="xs" className="max-w-md w-full">
          {networks.map((network) => (
            <Button
              key={network.id}
              onPress={() => onNetworkSelect(network.id)}
              variant="outline"
              size="lg"
              className="w-full rounded-xl h-16"
            >
              <ButtonText className="font-semibold text-lg">
                {network.name}
              </ButtonText>
            </Button>
          ))}
        </VStack>
      </Center>
    </Box>
  );
}