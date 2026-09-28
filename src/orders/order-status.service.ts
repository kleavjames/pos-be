import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class OrderStatusService {
  constructor(private readonly prisma: PrismaService) {}

  async canTransition(fromStatusId: string, toStatusId: string): Promise<boolean> {
    const transition = await this.prisma.orderStatusTransition.findUnique({
      where: {
        fromStatusId_toStatusId: { fromStatusId, toStatusId },
      },
    });
    return transition !== null;
  }

  async changeOrderStatus(
    orderId: string,
    toStatusCode: string,
    changedById?: string,
    note?: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { status: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status.isTerminal) {
      throw new BadRequestException(
        `Order is already in terminal status: ${order.status.code}`,
      );
    }

    const toStatus = await this.prisma.orderStatus.findUnique({
      where: { code: toStatusCode },
    });

    if (!toStatus) {
      throw new NotFoundException(`Order status not found: ${toStatusCode}`);
    }

    if (order.statusId === toStatus.id) {
      return order;
    }

    const allowed = await this.canTransition(order.statusId, toStatus.id);
    if (!allowed) {
      throw new BadRequestException(
        `Transition not allowed: ${order.status.code} -> ${toStatus.code}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { statusId: toStatus.id },
        include: { status: true },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatusId: order.statusId,
          toStatusId: toStatus.id,
          changedById,
          note,
        },
      });

      return updated;
    });
  }

  async markPaid(orderId: string, changedById?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { status: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.isPaid) {
      return order;
    }

    const now = new Date();

    if (order.status.code === 'PENDING_PAYMENT') {
      return this.prisma.$transaction(async (tx) => {
        const completed = await tx.orderStatus.findUnique({
          where: { code: 'COMPLETED' },
        });
        if (!completed) {
          throw new NotFoundException('COMPLETED status not found');
        }

        const allowed = await tx.orderStatusTransition.findUnique({
          where: {
            fromStatusId_toStatusId: {
              fromStatusId: order.statusId,
              toStatusId: completed.id,
            },
          },
        });
        if (!allowed) {
          throw new BadRequestException(
            'Cannot mark paid: transition to COMPLETED not allowed',
          );
        }

        const updated = await tx.order.update({
          where: { id: orderId },
          data: {
            isPaid: true,
            paidAt: now,
            statusId: completed.id,
          },
          include: { status: true },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId,
            fromStatusId: order.statusId,
            toStatusId: completed.id,
            changedById,
            note: 'Marked paid',
          },
        });

        return updated;
      });
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { isPaid: true, paidAt: now },
      include: { status: true },
    });
  }
}
