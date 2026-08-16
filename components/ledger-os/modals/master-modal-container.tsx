"use client"

import React from "react"
import LogTransactionModal from "./log-transaction-modal"
import TransferModal from "./transfer-modal"
import CustodialModal from "./custodial-modal"
import ExpenseDividerModal from "./expense-divider-modal"
import SavingsTargetModal from "./savings-target-modal"
import BudgetCapsModal from "./budget-caps-modal"
import AccountModal from "./account-modal"
import PlannedPaymentModal from "./planned-payment-modal"

export default function MasterModalContainer() {
  return (
    <>
      <LogTransactionModal />
      <TransferModal />
      <CustodialModal />
      <ExpenseDividerModal />
      <SavingsTargetModal />
      <BudgetCapsModal />
      <AccountModal />
      <PlannedPaymentModal />
    </>
  )
}
