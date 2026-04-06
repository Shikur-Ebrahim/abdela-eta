import { LotteryRound } from "../../types";

/**
 * Calculates the display number of sold tickets.
 * It uses a simulated growth of 1% per day since the start date,
 * but never less than the actual sold tickets.
 * 
 * @param lottery The lottery round data
 * @returns The number of sold tickets to display
 */
export const getDisplaySoldTickets = (lottery: LotteryRound): number => {
    const { startDate, drawDate, totalTickets, soldTickets, initialSoldPercent = 0, targetSalesPercent = 0 } = lottery;
    
    // If no start date, return actual sold tickets
    if (!startDate) return soldTickets;

    const start = new Date(startDate).getTime();
    const now = new Date().getTime();
    
    let simulatedPercent = initialSoldPercent;

    // If a target percentage is set, we scale linearly toward it over the lottery's duration
    if (targetSalesPercent > 0 && drawDate) {
        const end = new Date(drawDate).getTime();
        const totalDuration = end - start;
        
        if (totalDuration > 0) {
            const timePassed = now - start;
            // timeProgress moves from 0 to 1 as we approach the draw date
            const timeProgress = Math.min(1, Math.max(0, timePassed / totalDuration));
            
            // Linear progression from initial to target
            simulatedPercent = initialSoldPercent + (timeProgress * (targetSalesPercent - initialSoldPercent));
        }
    } else {
        // Legacy/Fallback: Increase by 1% for every day that passes
        const msPerDay = 24 * 60 * 60 * 1000;
        const daysPassed = Math.max(0, (now - start) / msPerDay);
        simulatedPercent = initialSoldPercent + daysPassed;
    }
    
    const simulatedSales = Math.floor(totalTickets * (simulatedPercent / 100));
    
    // Return the maximum of actual and simulated, capped at total tickets
    return Math.min(totalTickets, Math.max(soldTickets, simulatedSales));
};

/**
 * Calculates the sales progress percentage based on simulated/actual sales.
 */
export const getSalesProgress = (lottery: LotteryRound): number => {
    if (lottery.totalTickets <= 0) return 0;
    const displaySold = getDisplaySoldTickets(lottery);
    return Math.min(100, Math.round((displaySold / lottery.totalTickets) * 100));
};
