# Saga Orchestrator Pattern with AWS Step Functions & Lambda

## Overview

Instead of implementing the orchestrator in your application code, you can use **AWS Step Functions** to orchestrate the entire booking saga across your microservices. Each step in the workflow calls a **Lambda function** which invokes your service endpoints.

### Architecture Diagram

```
API Gateway
    ↓
Lambda (Initiator)
    ↓
Step Functions State Machine
    ├→ Lambda (Step 1: Validate Event)
    ├→ Lambda (Step 2: Reserve Inventory)
    ├→ Lambda (Step 3: Process Payment)
    ├→ Lambda (Step 4: Create Booking)
    ├→ Lambda (Step 5: Generate Tickets)
    ├→ Lambda (Step 6: Send Confirmation)
    └→ Step Functions handles retries & compensation automatically
```

---

## Key Benefits of Using AWS Step Functions

✅ **Visual Workflow**: See your saga execution flow in AWS Console  
✅ **Built-in Error Handling**: Automatic retries and catch blocks  
✅ **No Code Changes**: Services remain unchanged, pure orchestration  
✅ **Monitoring**: CloudWatch integration, execution history  
✅ **Compensation Automation**: Catch blocks handle rollbacks  
✅ **Scalability**: Handles 100K+ concurrent executions  
✅ **Cost-Effective**: Pay only for state transitions  

---

## Saga Pattern Implementation with Step Functions

### Step 1: Understand the State Machine Concept

A **State Machine** defines the workflow:
- **States**: Individual steps (Task states, Choice states, Catch blocks)
- **Transitions**: Move from one state to next on success
- **Error Handling**: Catch blocks define compensation logic

### Step 2: Define Your States

```
START
  ↓
Task: Validate Event
  ↓ (Success) / → Catch: Fail
Task: Reserve Inventory
  ↓ (Success) / → Catch: Fail → Compensation 1
Task: Process Payment
  ↓ (Success) / → Catch: Fail → Compensation 2
Task: Create Booking
  ↓ (Success) / → Catch: Fail → Compensation 3
Task: Generate Tickets
  ↓ (Success) / → Catch: Fail → Compensation 4
Task: Send Confirmation
  ↓ (Success) / → Catch: Fail (non-blocking)
END: Success
```

---

## Complete AWS Step Functions Implementation

### Step 1: Create Lambda Functions

You need 6 Lambda functions (one for each step):

#### Lambda 1: Validate Event
```javascript
// lambda/validateEvent.js
exports.handler = async (event) => {
  const { eventId, ticketTypeId, quantity } = event;
  
  try {
    // Call your Event Service
    const response = await fetch(
      `${process.env.EVENT_SERVICE_URL}/api/events/validate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, ticketTypeId, quantity })
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Event validation failed: ${data.message}`);
    }
    
    return {
      event: data.event,
      ticketType: data.ticketType,
      totalPrice: data.totalPrice,
      quantity: data.quantity
    };
  } catch (error) {
    throw new Error(`[Step 1] ${error.message}`);
  }
};
```

#### Lambda 2: Reserve Inventory
```javascript
// lambda/reserveInventory.js
exports.handler = async (event) => {
  const { eventId, ticketTypeId, quantity, userId } = event;
  
  try {
    const response = await fetch(
      `${process.env.INVENTORY_SERVICE_URL}/api/inventory-holds/create`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          ticketTypeId,
          quantity,
          userId,
          holdExpiryMinutes: 15
        })
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Inventory reservation failed: ${data.message}`);
    }
    
    return {
      holdId: data.holdId,
      status: data.status,
      expiresAt: data.expiresAt
    };
  } catch (error) {
    throw new Error(`[Step 2] ${error.message}`);
  }
};
```

#### Lambda 3: Process Payment
```javascript
// lambda/processPayment.js
exports.handler = async (event) => {
  const { userId, eventId, totalPrice, currency, paymentMethod, paymentMethodId, bookingReference } = event;
  
  try {
    const response = await fetch(
      `${process.env.PAYMENT_SERVICE_URL}/api/payments/process`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          eventId,
          amount: totalPrice,
          currency,
          paymentMethod,
          paymentMethodId,
          idempotencyKey: bookingReference // Prevent duplicate charges
        })
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Payment processing failed: ${data.message}`);
    }
    
    return {
      transactionId: data.transactionId,
      paymentId: data.paymentId,
      status: data.status
    };
  } catch (error) {
    throw new Error(`[Step 3] ${error.message}`);
  }
};
```

#### Lambda 4: Create Booking
```javascript
// lambda/createBooking.js
exports.handler = async (event) => {
  const { userId, eventId, ticketTypeId, quantity, totalPrice, currency, bookingReference, paymentId } = event;
  
  try {
    const response = await fetch(
      `${process.env.BOOKING_SERVICE_URL}/api/bookings/create-direct`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          eventId,
          bookingReference,
          status: 'CONFIRMED',
          totalAmount: totalPrice,
          currency,
          paymentStatus: 'COMPLETED',
          items: [{
            ticketTypeId,
            quantity,
            unitPrice: totalPrice / quantity,
            subtotal: totalPrice
          }]
        })
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Booking creation failed: ${data.message}`);
    }
    
    return {
      bookingId: data.bookingId,
      bookingReference: data.bookingReference
    };
  } catch (error) {
    throw new Error(`[Step 4] ${error.message}`);
  }
};
```

#### Lambda 5: Generate Tickets
```javascript
// lambda/generateTickets.js
exports.handler = async (event) => {
  const { bookingId, ticketTypeId, quantity, eventId } = event;
  
  try {
    const response = await fetch(
      `${process.env.BOOKING_SERVICE_URL}/api/tickets/generate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          ticketTypeId,
          quantity,
          eventId
        })
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Ticket generation failed: ${data.message}`);
    }
    
    return {
      ticketCount: data.ticketCount,
      ticketIds: data.ticketIds
    };
  } catch (error) {
    throw new Error(`[Step 5] ${error.message}`);
  }
};
```

#### Lambda 6: Send Confirmation
```javascript
// lambda/sendConfirmation.js
exports.handler = async (event) => {
  const { userId, bookingId, bookingReference, eventTitle, totalPrice, ticketCount } = event;
  
  try {
    // Non-critical step - don't fail saga if this fails
    const response = await fetch(
      `${process.env.NOTIFICATION_SERVICE_URL}/api/notifications/booking-confirmation`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          bookingId,
          bookingReference,
          eventTitle,
          totalPrice,
          ticketCount
        })
      }
    );
    
    if (!response.ok) {
      console.warn('Notification failed - will retry asynchronously');
      // Don't throw - this step is non-critical
      return { notificationQueued: true };
    }
    
    return { notificationSent: true };
  } catch (error) {
    console.warn(`Notification sending failed: ${error.message}`);
    return { notificationQueued: true }; // Non-critical
  }
};
```

#### Lambda 7: Compensation Functions

```javascript
// lambda/compensations/releaseInventoryHold.js
exports.handler = async (event) => {
  const { holdId } = event;
  
  try {
    const response = await fetch(
      `${process.env.INVENTORY_SERVICE_URL}/api/inventory-holds/${holdId}/release`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Booking saga failed' })
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to release inventory hold');
    }
    
    console.log(`✓ Inventory hold released: ${holdId}`);
    return { success: true };
  } catch (error) {
    console.error(`Compensation failed: ${error.message}`);
    throw error; // Will retry
  }
};
```

```javascript
// lambda/compensations/refundPayment.js
exports.handler = async (event) => {
  const { paymentId } = event;
  
  try {
    const response = await fetch(
      `${process.env.PAYMENT_SERVICE_URL}/api/refunds/initiate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          reason: 'Booking saga failed - automatic refund'
        })
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to refund payment');
    }
    
    console.log(`✓ Payment refunded: ${paymentId}`);
    return { success: true };
  } catch (error) {
    console.error(`Compensation failed: ${error.message}`);
    throw error;
  }
};
```

```javascript
// lambda/compensations/cancelBooking.js
exports.handler = async (event) => {
  const { bookingId } = event;
  
  try {
    const response = await fetch(
      `${process.env.BOOKING_SERVICE_URL}/api/bookings/${bookingId}/cancel`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Booking saga failed' })
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to cancel booking');
    }
    
    console.log(`✓ Booking cancelled: ${bookingId}`);
    return { success: true };
  } catch (error) {
    console.error(`Compensation failed: ${error.message}`);
    throw error;
  }
};
```

---

### Step 2: Create AWS Step Functions State Machine (JSON)

```json
{
  "Comment": "Event Ticket Booking Saga Orchestrator",
  "StartAt": "GenerateBookingReference",
  "States": {
    "GenerateBookingReference": {
      "Type": "Pass",
      "Parameters": {
        "bookingReference.$": "$.bookingReference",
        "userId.$": "$.userId",
        "eventId.$": "$.eventId",
        "ticketTypeId.$": "$.ticketTypeId",
        "quantity.$": "$.quantity",
        "paymentMethod.$": "$.paymentMethod",
        "paymentMethodId.$": "$.paymentMethodId",
        "currency.$": "$.currency",
        "bookingReference.$": "$$.State.EnteredTime"
      },
      "Next": "Step1_ValidateEvent"
    },
    
    "Step1_ValidateEvent": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:ACCOUNT_ID:function:validateEvent",
      "Title": "Validate Event & Ticket Type",
      "Parameters": {
        "eventId.$": "$.eventId",
        "ticketTypeId.$": "$.ticketTypeId",
        "quantity.$": "$.quantity"
      },
      "Next": "Step2_ReserveInventory",
      "Catch": [
        {
          "ErrorEquals": ["States.TaskFailed"],
          "ResultPath": "$.error",
          "Next": "BookingFailed"
        }
      ],
      "TimeoutSeconds": 5,
      "Retry": [
        {
          "ErrorEquals": ["States.TaskFailed"],
          "IntervalSeconds": 2,
          "MaxAttempts": 2,
          "BackoffRate": 2.0
        }
      ]
    },

    "Step2_ReserveInventory": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:ACCOUNT_ID:function:reserveInventory",
      "Title": "Reserve Inventory",
      "Parameters": {
        "eventId.$": "$.eventId",
        "ticketTypeId.$": "$.ticketTypeId",
        "quantity.$": "$.quantity",
        "userId.$": "$.userId"
      },
      "ResultPath": "$.reserveInventoryResult",
      "Next": "Step3_ProcessPayment",
      "Catch": [
        {
          "ErrorEquals": ["States.TaskFailed"],
          "ResultPath": "$.error",
          "Next": "CompensationFailed"
        }
      ],
      "TimeoutSeconds": 5,
      "Retry": [
        {
          "ErrorEquals": ["States.TaskFailed"],
          "IntervalSeconds": 2,
          "MaxAttempts": 2,
          "BackoffRate": 2.0
        }
      ]
    },

    "Step3_ProcessPayment": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:ACCOUNT_ID:function:processPayment",
      "Title": "Process Payment",
      "Parameters": {
        "userId.$": "$.userId",
        "eventId.$": "$.eventId",
        "totalPrice.$": "$.reserveInventoryResult.totalPrice",
        "currency.$": "$.currency",
        "paymentMethod.$": "$.paymentMethod",
        "paymentMethodId.$": "$.paymentMethodId",
        "bookingReference.$": "$.bookingReference"
      },
      "ResultPath": "$.paymentResult",
      "Next": "Step4_CreateBooking",
      "Catch": [
        {
          "ErrorEquals": ["States.TaskFailed"],
          "ResultPath": "$.error",
          "Next": "Compensation_ReleaseInventory"
        }
      ],
      "TimeoutSeconds": 10,
      "Retry": [
        {
          "ErrorEquals": ["States.TaskFailed"],
          "IntervalSeconds": 2,
          "MaxAttempts": 2,
          "BackoffRate": 2.0
        }
      ]
    },

    "Step4_CreateBooking": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:ACCOUNT_ID:function:createBooking",
      "Title": "Create Booking",
      "Parameters": {
        "userId.$": "$.userId",
        "eventId.$": "$.eventId",
        "ticketTypeId.$": "$.ticketTypeId",
        "quantity.$": "$.quantity",
        "totalPrice.$": "$.reserveInventoryResult.totalPrice",
        "currency.$": "$.currency",
        "bookingReference.$": "$.bookingReference",
        "paymentId.$": "$.paymentResult.paymentId"
      },
      "ResultPath": "$.bookingResult",
      "Next": "Step5_GenerateTickets",
      "Catch": [
        {
          "ErrorEquals": ["States.TaskFailed"],
          "ResultPath": "$.error",
          "Next": "Compensation_RefundPayment"
        }
      ],
      "TimeoutSeconds": 5,
      "Retry": [
        {
          "ErrorEquals": ["States.TaskFailed"],
          "IntervalSeconds": 2,
          "MaxAttempts": 2,
          "BackoffRate": 2.0
        }
      ]
    },

    "Step5_GenerateTickets": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:ACCOUNT_ID:function:generateTickets",
      "Title": "Generate Tickets",
      "Parameters": {
        "bookingId.$": "$.bookingResult.bookingId",
        "ticketTypeId.$": "$.ticketTypeId",
        "quantity.$": "$.quantity",
        "eventId.$": "$.eventId"
      },
      "ResultPath": "$.ticketsResult",
      "Next": "Step6_SendConfirmation",
      "Catch": [
        {
          "ErrorEquals": ["States.TaskFailed"],
          "ResultPath": "$.error",
          "Next": "Compensation_CancelBooking"
        }
      ],
      "TimeoutSeconds": 10,
      "Retry": [
        {
          "ErrorEquals": ["States.TaskFailed"],
          "IntervalSeconds": 2,
          "MaxAttempts": 2,
          "BackoffRate": 2.0
        }
      ]
    },

    "Step6_SendConfirmation": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:ACCOUNT_ID:function:sendConfirmation",
      "Title": "Send Confirmation",
      "Parameters": {
        "userId.$": "$.userId",
        "bookingId.$": "$.bookingResult.bookingId",
        "bookingReference.$": "$.bookingReference",
        "eventTitle.$": "$.eventTitle",
        "totalPrice.$": "$.reserveInventoryResult.totalPrice",
        "ticketCount.$": "$.ticketsResult.ticketCount"
      },
      "ResultPath": "$.notificationResult",
      "Next": "BookingSuccess",
      "Catch": [
        {
          "ErrorEquals": ["States.ALL"],
          "ResultPath": "$.error",
          "Next": "BookingSuccess"
        }
      ],
      "TimeoutSeconds": 5
    },

    "Compensation_ReleaseInventory": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:ACCOUNT_ID:function:releaseInventoryHold",
      "Title": "Compensation: Release Inventory Hold",
      "Parameters": {
        "holdId.$": "$.reserveInventoryResult.holdId"
      },
      "ResultPath": "$.compensationResult",
      "Next": "BookingFailed",
      "Catch": [
        {
          "ErrorEquals": ["States.ALL"],
          "ResultPath": "$.compensationError",
          "Next": "CompensationFailed"
        }
      ],
      "TimeoutSeconds": 5,
      "Retry": [
        {
          "ErrorEquals": ["States.ALL"],
          "IntervalSeconds": 2,
          "MaxAttempts": 2,
          "BackoffRate": 2.0
        }
      ]
    },

    "Compensation_RefundPayment": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:ACCOUNT_ID:function:refundPayment",
      "Title": "Compensation: Refund Payment",
      "Parameters": {
        "paymentId.$": "$.paymentResult.paymentId"
      },
      "ResultPath": "$.compensationResult",
      "Next": "Compensation_ReleaseInventory",
      "Catch": [
        {
          "ErrorEquals": ["States.ALL"],
          "ResultPath": "$.compensationError",
          "Next": "CompensationFailed"
        }
      ],
      "TimeoutSeconds": 10,
      "Retry": [
        {
          "ErrorEquals": ["States.ALL"],
          "IntervalSeconds": 2,
          "MaxAttempts": 2,
          "BackoffRate": 2.0
        }
      ]
    },

    "Compensation_CancelBooking": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:ACCOUNT_ID:function:cancelBooking",
      "Title": "Compensation: Cancel Booking",
      "Parameters": {
        "bookingId.$": "$.bookingResult.bookingId"
      },
      "ResultPath": "$.compensationResult",
      "Next": "Compensation_RefundPayment",
      "Catch": [
        {
          "ErrorEquals": ["States.ALL"],
          "ResultPath": "$.compensationError",
          "Next": "CompensationFailed"
        }
      ],
      "TimeoutSeconds": 5,
      "Retry": [
        {
          "ErrorEquals": ["States.ALL"],
          "IntervalSeconds": 2,
          "MaxAttempts": 2,
          "BackoffRate": 2.0
        }
      ]
    },

    "BookingSuccess": {
      "Type": "Succeed"
    },

    "BookingFailed": {
      "Type": "Fail",
      "Error": "BookingFailed",
      "Cause": "Booking process failed"
    },

    "CompensationFailed": {
      "Type": "Fail",
      "Error": "CompensationFailed",
      "Cause": "Compensation process failed - manual intervention required"
    }
  }
}
```

---

### Step 3: Create API Gateway Endpoint to Start Execution

```javascript
// Lambda: Initiate Booking (triggered by API Gateway)
const AWS = require('aws-sdk');
const stepFunctions = new AWS.StepFunctions();

exports.handler = async (event) => {
  try {
    const { userId, eventId, ticketTypeId, quantity, paymentMethod, paymentMethodId } = JSON.parse(event.body);

    // Start step function execution
    const params = {
      stateMachineArn: process.env.STATE_MACHINE_ARN,
      input: JSON.stringify({
        userId,
        eventId,
        ticketTypeId,
        quantity,
        paymentMethod,
        paymentMethodId,
        currency: 'USD',
        timestamp: new Date().toISOString()
      })
    };

    const result = await stepFunctions.startExecution(params).promise();

    return {
      statusCode: 202, // Accepted
      body: JSON.stringify({
        success: true,
        message: 'Booking saga initiated',
        executionArn: result.executionArn,
        executionName: result.name
      })
    };

  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
```

---

## AWS Step Functions Advantages Over Application Code

| Aspect | Application Code | AWS Step Functions |
|---|---|---|
| **Error Handling** | Manual try-catch blocks | Built-in Catch blocks |
| **Retries** | Manual exponential backoff | Automatic retry policy |
| **Timeout** | Manual timer logic | Built-in TimeoutSeconds |
| **Visibility** | Logs only | Visual workflow + Logs |
| **Compensation** | Manual order management | Catch blocks chain auto-compensation |
| **Monitoring** | CloudWatch metrics | Step Functions Dashboard |
| **Concurrency** | App instance limit | Millions of concurrent executions |
| **Cost** | Round-the-clock running | Pay per state transition |
| **Scalability** | Horizontal scaling complex | Automatic scaling |

---

## Execution Flow Diagram (What AWS Does Automatically)

```
User Request
    ↓
API Gateway
    ↓
Lambda: InitiateBooking
    ↓
Step Functions StartExecution
    ↓
┌─────────────────────────────────────────────┐
│ STEP FUNCTION STATE MACHINE EXECUTION       │
├─────────────────────────────────────────────┤
│ Step 1: ValidateEvent Lambda                │ Success ✓
│ Step 2: ReserveInventory Lambda             │ Success ✓
│ Step 3: ProcessPayment Lambda               │ FAILED ✗
│                  ↓                           │
│          Catch Block Triggered              │
│                  ↓                           │
│ Compensation 1: ReleaseInventoryHold Lambda │ Success ✓
│                  ↓                           │
│ Compensation Complete → Fail State          │
└─────────────────────────────────────────────┘
    ↓
Return Error to User
```

---

## Environment Variables in Lambda

Create Lambda environment variables for service URLs:

```
EVENT_SERVICE_URL=https://event-service.example.com
INVENTORY_SERVICE_URL=https://inventory-service.example.com
PAYMENT_SERVICE_URL=https://payment-service.example.com
BOOKING_SERVICE_URL=https://booking-service.example.com
NOTIFICATION_SERVICE_URL=https://notification-service.example.com
STATE_MACHINE_ARN=arn:aws:states:us-east-1:ACCOUNT:stateMachine:BookingSaga
```

---

## Key Points for AWS Implementation

### 1. **Idempotency**
- Step Functions will retry on timeout
- Use `idempotencyKey` in payment requests to prevent duplicate charges
- Lambda should be idempotent (safe to call multiple times)

### 2. **Error Types to Catch**
```json
"Catch": [
  {
    "ErrorEquals": ["States.TaskFailed"],  // Lambda threw error
    "Next": "NextState"
  },
  {
    "ErrorEquals": ["States.Timeout"],     // Lambda timeout
    "Next": "NextState"
  },
  {
    "ErrorEquals": ["States.ALL"],         // Any error
    "Next": "NextState"
  }
]
```

### 3. **Retry Strategy**
```json
"Retry": [
  {
    "ErrorEquals": ["States.TaskFailed"],
    "IntervalSeconds": 2,        // Start with 2 seconds
    "MaxAttempts": 2,            // Retry max 2 times
    "BackoffRate": 2.0           // Double wait time each retry
  }
]
```

### 4. **Cost Optimization**
- Each state transition costs ~$0.000025
- 1,000,000 transitions ≈ $25/month (very cheap!)
- Better than running orchestrator service 24/7

### 5. **Monitoring**
- View execution history in AWS Step Functions Console
- CloudWatch Logs auto-created per execution
- Get detailed error stack traces
- See exact timing for each state

---

## Next Steps

1. ✅ Create Lambda functions file (keep code minimal, just HTTP calls)
2. ✅ Define State Machine JSON (paste into AWS Console)
3. ✅ Set environment variables in Lambda
4. ✅ Create IAM role with permissions for Step Functions → Lambda
5. ✅ Test each Lambda individually first
6. ✅ Deploy State Machine (dry-run execution first)
7. ✅ Create API Gateway endpoint
8. ✅ Monitor executions in AWS Console

---

## Testing Checklist

- [ ] Test each Lambda function independently with POSTMAN/curl
- [ ] Test State Machine dry-run before deploying
- [ ] Test happy path: All steps succeed
- [ ] Test error at each step (1-5): Verify compensation runs
- [ ] Test timeout scenarios
- [ ] Test retry logic
- [ ] Monitor CloudWatch logs
- [ ] Check execution history in Step Functions console
- [ ] Load test with concurrent bookings

---

## Benefits Summary

✅ No orchestrator code to maintain in your application  
✅ Automatic retry and error handling  
✅ Full visibility into workflow execution  
✅ Compensation happens automatically on failure  
✅ Scales to millions of concurrent bookings  
✅ Easy to update workflow (just update JSON)  
✅ Cost-effective (pay per transition, not per minute)  
✅ AWS-managed (no servers to maintain)  

