export type Car = {
    id: string;
    make: string;
    model: string;
    year: number;
    color: string;
    chassisNumber: string;
    imageIds: string[]; // Cloudinary
    status: 'available' | 'assigned_to_lottery' | 'awarded';
};

export type LotteryRound = {
    id: string;
    carTitle: string;
    carValue: number;
    imageId: string;
    mediaType?: 'image' | 'video';
    gameNumber?: number;
    ticketPrice: number; // Single ticket price
    bundlePrices?: {      // e.g. { "2": 500, "5": 1000 }
        [ticketCount: number]: number;
    };
    totalTickets: number;
    numbersPerTicket: number;
    soldTickets: number;
    timeLength: {         // Duration logic
        months: number;
        days: number;
        hours: number;
        minutes: number;
    };
    startDate: Date;
    drawDate: Date;
    initialSoldPercent?: number;
    targetSalesPercent?: number;
    status: 'draft' | 'active' | 'completed' | 'cancelled';
    winnerId?: string;
    winnerTicketNumber?: string;
    blockedNumbers?: number[]; // Admin-selected numbers to exclude from purchase
    maxTicketsPerPurchase?: number; // Maximum tickets (pairs) allowed in a single selection
};

export type User = {
    uid: string;
    phoneNumber: string;
    displayName?: string;
    email?: string;
    status: 'active' | 'suspended';
    createdAt: Date;
};

export type Ticket = {
    id: string;
    roundId: string;
    userId: string;
    ticketNumber: string; // e.g., ZC-12345
    purchaseDate: Date;
    paymentStatus: 'pending' | 'completed' | 'failed';
    transactionRef: string;
};

export type PaymentMethod = {
    id: string;
    provider: string;
    accountHolderName: string;
    accountNumber: string;
    logoId: string;
    isActive: boolean;
};

export type TelegramSettings = {
    channelLink: string;
    supportUsername: string;
    supportPhone?: string;
    updatedAt: Date;
};

export type PurchaseOrder = {
    id: string;
    lotteryId: string;
    fullName: string;
    phoneNumber: string;
    region?: string;
    city?: string;
    idCardUrl?: string; // Cloudinary
    paymentScreenshotUrl: string; // Cloudinary
    selectedNumbers: number[];
    totalPrice: number;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
};

export type BusinessLicense = {
    imageUrl: string;
    active: boolean;
    maxViews: number;
    updatedAt: Date;
};

export type WinnerSettings = {
    winnerNumber: number;
    isActive: boolean;
    lotteryId?: string;
    updatedAt: Date;
    showAnimation: boolean;
    revealDuration?: number; // in seconds
    imageId?: string;
    carTitle?: string;
    telegramUsername?: string;
};
