import { eq } from 'drizzle-orm';
import db from '../db/connection';
import { transactions, dataPlans, dataProviders, providerPlanMappings } from '../db/schema';
import { gladTidingsService } from './gladtidings';

export interface DataPurchaseResult {
  success: boolean;
  transactionId: string;
  providerReference?: string;
  error?: string;
  shouldRetry?: boolean;
}

class DataPurchaseService {
  /**
   * Process data purchase for a confirmed payment
   */
  async processDataPurchase(transactionId: string): Promise<DataPurchaseResult> {
    console.log(`[DataPurchase] Processing data purchase for transaction ${transactionId}`);

    try {
      // Get transaction details
      const [transaction] = await db
        .select()
        .from(transactions)
        .where(eq(transactions.id, transactionId))
        .limit(1);

      if (!transaction) {
        return {
          success: false,
          transactionId,
          error: 'Transaction not found',
          shouldRetry: false
        };
      }

      // Check if already processed
      if (transaction.status === 'completed') {
        console.log(`[DataPurchase] Transaction ${transactionId} already completed`);
        return {
          success: true,
          transactionId,
          providerReference: transaction.provider_reference || undefined
        };
      }

      // Update status to processing
      await db
        .update(transactions)
        .set({
          status: 'processing',
          updated_at: new Date()
        })
        .where(eq(transactions.id, transactionId));

      // Get data plan and provider mapping
      const planWithMapping = await this.getProviderMapping(transaction.data_plan_id);
      
      if (!planWithMapping) {
        await this.markTransactionFailed(transactionId, 'Provider mapping not found');
        return {
          success: false,
          transactionId,
          error: 'Data plan provider mapping not found',
          shouldRetry: false
        };
      }

      if (!planWithMapping.provider.is_active) {
        await this.markTransactionFailed(transactionId, 'Provider is inactive');
        return {
          success: false,
          transactionId,
          error: 'Data provider is currently unavailable',
          shouldRetry: true
        };
      }

      // Process with GladTidings
      if (planWithMapping.provider.name === 'gladtidings') {
        return await this.processGladTidingsPurchase(transaction, planWithMapping);
      }

      // Add other providers here in the future
      await this.markTransactionFailed(transactionId, 'Unsupported provider');
      return {
        success: false,
        transactionId,
        error: 'Unsupported data provider',
        shouldRetry: false
      };

    } catch (error) {
      console.error(`[DataPurchase] Error processing transaction ${transactionId}:`, error);
      
      await this.markTransactionFailed(transactionId, error instanceof Error ? error.message : 'Unknown error');
      
      return {
        success: false,
        transactionId,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        shouldRetry: true
      };
    }
  }

  /**
   * Process data purchase with GladTidings
   */
  private async processGladTidingsPurchase(transaction: any, planWithMapping: any): Promise<DataPurchaseResult> {
    try {
      console.log(`[DataPurchase] Processing GladTidings purchase for ${transaction.id}`);

      const gladTidingsResponse = await gladTidingsService.purchaseData({
        network: transaction.network,
        phoneNumber: transaction.phone_number,
        planId: parseInt(planWithMapping.mapping.provider_plan_id),
        transactionId: transaction.id,
        portedNumber: true
      });

      // Update transaction with success
      await db
        .update(transactions)
        .set({
          status: 'completed',
          provider_reference: gladTidingsResponse.id.toString(),
          provider_response: gladTidingsResponse,
          data_provider_id: planWithMapping.provider.id,
          updated_at: new Date()
        })
        .where(eq(transactions.id, transaction.id));

      console.log(`[DataPurchase] GladTidings purchase successful for ${transaction.id}`);

      return {
        success: true,
        transactionId: transaction.id,
        providerReference: gladTidingsResponse.id.toString()
      };

    } catch (error) {
      console.error(`[DataPurchase] GladTidings purchase failed for ${transaction.id}:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'GladTidings API error';
      await this.markTransactionFailed(transaction.id, errorMessage);

      // Determine if we should retry
      const shouldRetry = errorMessage.includes('Network error') || 
                         errorMessage.includes('timeout') ||
                         errorMessage.includes('temporarily unavailable');

      return {
        success: false,
        transactionId: transaction.id,
        error: errorMessage,
        shouldRetry
      };
    }
  }

  /**
   * Get provider mapping for a data plan
   */
  private async getProviderMapping(dataPlanId: string) {
    try {
      const [result] = await db
        .select({
          dataPlan: dataPlans,
          provider: dataProviders,
          mapping: providerPlanMappings
        })
        .from(dataPlans)
        .innerJoin(providerPlanMappings, eq(dataPlans.id, providerPlanMappings.data_plan_id))
        .innerJoin(dataProviders, eq(providerPlanMappings.data_provider_id, dataProviders.id))
        .where(eq(dataPlans.id, dataPlanId))
        .limit(1);

      return result;
    } catch (error) {
      console.error('[DataPurchase] Error getting provider mapping:', error);
      return null;
    }
  }

  /**
   * Mark transaction as failed
   */
  private async markTransactionFailed(transactionId: string, error: string) {
    try {
      await db
        .update(transactions)
        .set({
          status: 'failed',
          provider_response: { error, timestamp: new Date().toISOString() },
          updated_at: new Date()
        })
        .where(eq(transactions.id, transactionId));
    } catch (updateError) {
      console.error(`[DataPurchase] Failed to update transaction status for ${transactionId}:`, updateError);
    }
  }

  /**
   * Retry failed data purchase
   */
  async retryDataPurchase(transactionId: string): Promise<DataPurchaseResult> {
    console.log(`[DataPurchase] Retrying data purchase for transaction ${transactionId}`);
    
    // Reset status to allow retry
    await db
      .update(transactions)
      .set({
        status: 'payment_completed', // Reset to payment completed state
        updated_at: new Date()
      })
      .where(eq(transactions.id, transactionId));

    return this.processDataPurchase(transactionId);
  }
}

export const dataPurchaseService = new DataPurchaseService();
export default dataPurchaseService;