import cron from "node-cron";
import { syncProducts } from "../services/productSync.service.js";

export const startProductSyncCron = () => {
  // for this edit video im changeing setting to run cron job currently every minute 
  // for testing purpose but in production it should be set to run every day
  //  at midnight or as per requirement
  // Runs every day at midnight 
  cron.schedule("0 0 * * *", async () => {
    console.log("⏰ Running product sync cron...");
    await syncProducts();
  });

  console.log("🕒 Product sync cron started");
};
