import axios from 'axios';
import { NotFoundError } from '../utils/errors';
import { turnoRepository } from '../repositories/turnoRepository';
import { db } from '../config/database';
import { EstadoPago, ProveedorPago } from '../types';

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || '';
const MP_API_URL = 'https://api.mercadopago.com';

class MercadoPagoService {
  private async makeRequest(method: string, endpoint: string, data?: any) {
    try {
      const response = await axios({
        method,
        url: `${MP_API_URL}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        data
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Mercado Pago API Error: ${error.response.data.message || error.message}`);
      }
      throw error;
    }
  }

  async createPreference(turnoId: number, barberiaId: number, backUrl: string): Promise<any> {
    const turno = await turnoRepository.findById(turnoId, barberiaId);
    if (!turno) {
      throw new NotFoundError('Turno');
    }

    const preference = {
      items: [
        {
          title: `Turno #${turnoId}`,
          quantity: 1,
          unit_price: parseFloat(turno.precio_total.toString())
        }
      ],
      back_urls: {
        success: `${backUrl}/pago/exito`,
        failure: `${backUrl}/pago/error`,
        pending: `${backUrl}/pago/pendiente`
      },
      auto_return: 'approved',
      external_reference: `turno_${turnoId}`,
      notification_url: `${process.env.API_URL || 'http://localhost:3000'}/api/pagos/webhook`
    };

    const result = await this.makeRequest('POST', '/checkout/preferences', preference);
    return result;
  }

  async processWebhook(data: any): Promise<void> {
    const { type, data: webhookData } = data;

    if (type === 'payment') {
      const paymentId = webhookData.id;
      const payment = await this.makeRequest('GET', `/v1/payments/${paymentId}`);

      const externalReference = payment.external_reference;
      if (!externalReference || !externalReference.startsWith('turno_')) {
        return;
      }

      const turnoId = parseInt(externalReference.replace('turno_', ''));
      
      // Buscar el turno en la base de datos para obtener barberiaId
      const [turnos] = await db.execute(
        'SELECT barberia_id FROM turnos WHERE id = ?',
        [turnoId]
      );
      const turnosArray = turnos as any[];
      
      if (turnosArray.length === 0) {
        return;
      }

      const barberiaId = turnosArray[0].barberia_id;

      const estado = payment.status === 'approved' ? EstadoPago.PAGADO : 
                     payment.status === 'rejected' ? EstadoPago.FALLIDO : 
                     EstadoPago.FALLIDO;

      await db.execute(
        `INSERT INTO pagos 
         (barberia_id, turno_id, monto, estado, proveedor, referencia_externa) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          barberiaId,
          turnoId,
          payment.transaction_amount,
          estado,
          ProveedorPago.MERCADO_PAGO,
          paymentId.toString()
        ]
      );
    }
  }
}

export const mercadoPagoService = new MercadoPagoService();

