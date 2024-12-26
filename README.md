# 🚀 Hackathon Web3 DApps on Cardano Server

This project is a **Marketplace DApps** running on the **Cardano Server**, using **MeshJS** as the blockchain connector and **Aiken** for smart contract implementation.

---

## 📋 Table of Contents
1. [Introduction](#introduction)
2. [Features](#features)
   - [Minihackathon-1](#minihackathon-1)
   - [Minihackathon-2](#minihackathon-2)
3. [Authentication & Sessions](#authentication--sessions)
4. [Smart Contract Features](#smart-contract-features)
5. [UI Improvements](#ui-improvements)
6. [Contributors](#contributors)

---

## 🔑 Features

### Minihackathon-1
- **Authentication System**:
  - Implements JWT-based session management.
  - Sessions expire within 1 hour and are deleted upon logout.
  - Sessions store the wallet address and user level based on NFT assets.

- **User Levels**:
  - **🥈 Silver Member**: Browse the marketplace.
  - **🥇 Gold Member**: Buy items and validate delivery.
  - **💎 Platinum Member**: Full access, including withdrawing funds.

### Minihackathon-2
- **Transaction Management**:
  - Currency stored in smart contracts when buying items.
  - Users can validate delivery and mark transactions as "done."

- **Smart Contract Constructors**:
  - Validate withdrawals.
  - Update delivery status in the datum (pending → done).

---

## 🔐 Authentication & Sessions

- Users connect their wallet to create a session.
- Sessions are stored in cookies, securely maintaining:
  - Wallet Address.
  - User Level (determined by NFT ownership).
- Session validity is checked on every page load, allowing seamless navigation while ensuring security.

---

## 🛠️ Smart Contract Features

- **Ownership Validation**: Transactions are bound to their respective owners.
- **Withdrawals**: Platinum members can withdraw funds collected from sales.
- **State Updates**: Delivery status can be updated from "pending" to "done" only by the transaction owner.

---

## 💡 UI Improvements

- **Notifications**:
  - Added authentication notifications for a smoother user experience.
- **Parent Layout**:
  - Simplified wallet connection to one-time per session.
  - Easier navigation between pages.
- **Refresh Button**:
  - Allows users to load new transactions without refreshing the entire page.
- **Modularity**:
  - Grouping auth and service on api, utilizations, and smart contract script and transaction builder in their own folder, to reduce redundancy and improve maintainability.    

---

## 👥 Contributors

- **Jason**  
  [GitHub](https://github.com/JasonImanuelK) | [LinkedIn](https://linkedin.com/in/jason-kasman)

- **Frederick**  
  [GitHub](https://github.com/HYL-TX) | [LinkedIn](https://www.linkedin.com/in/frederick-halim)

---

## 📬 Contact
For questions or feedback, reach out to [jasonkasman@gmail.com] or [frederick.halim96@gmail.com].

