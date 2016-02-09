using Microsoft.AspNet.SignalR;
using System;
using System.IO;
using System.Linq;
using System.Web.Mvc;

namespace Parking_Availability_Map.Controllers
{
    public class ApiController : Controller
    {
        public string GetLot()
        {
            return readFile(currentLotPath);
        }

        public string GetLotHistory()
        {
            return readFile(historicLotPath);
        }

        public string Update(string lot)
        {
            //random data handler
            if (lot.StartsWith("rnd"))
            {
                double p = 50;
                try { p = double.Parse(lot.Substring(3)); }
                catch { }
                lot = "";
                var rnd = new Random();
                for (int i = 0; i < 210; i++)
                {
                    lot += rnd.Next(100) < p ? "1" : "0";
                }
            }

            //handle hex inputs
            if (lot.StartsWith("0x"))
            {
                try
                {
                    lot = String.Join(String.Empty, lot.Substring(2).Select(
                        c => reverseString(Convert.ToString(Convert.ToInt32(c.ToString(), 16), 2).PadLeft(4, '0'))
                    ));
                }
                catch { }
            }

            //push data to all clients
            var context = GlobalHost.ConnectionManager.GetHubContext<LotHub>();
            context.Clients.All.render(lot);

            //save current lot info to disk
            writeFile(currentLotPath, lot);
            string newHistlotStr = writeHistory(lot);
            string newAgelotStr = writeAge(lot);

            return "Lot Age: \n\r" + newHistlotStr;
        }

        public string ClearHistory()
        {
            writeFile(historicLotPath, "0");
            return "Successfully Cleared!";
        }

        public string ClearAge()
        {
            writeFile(ageLotPath, "0");
            return "Successfully Cleared!";
        }



        //----------------------------------------------------------------

        //private string path = System.IO.Path.GetTempPath() + @"file.txt";

        private string lotPath
        {
            get { return Server.MapPath("~/") + @"lot.txt"; }
            set { lotPath = value; }
        }

        private string currentLotPath
        {
            get { return Server.MapPath("~/") + @"current_lot.txt"; }
            set { currentLotPath = value; }
        }

        private string historicLotPath
        {
            get { return Server.MapPath("~/") + @"historic_lot.txt"; }
            set { historicLotPath = value; }
        }

        private string ageLotPath
        {
            get { return Server.MapPath("~/") + @"age_lot.txt"; }
            set { ageLotPath = value; }
        }

        private string writeAge(string lot)
        {
            //read age of lot from disk
            int[] oldAgeLot;
            try { oldAgeLot = readFile(ageLotPath)?.Split(',').Select(x => int.Parse(x)).ToArray(); }
            catch { oldAgeLot = new int[0]; }
            var newAgelot = new int[lot.Length];

            //add current lot data to age
            for (int i = 0; i < lot.Length; i++)
            {
                if (lot[i] == '0')
                    newAgelot[i] = 0;
                else
                {
                    if (oldAgeLot.Length > i)
                        newAgelot[i] = oldAgeLot[i] + 1;
                    else
                        newAgelot[i] = 0;
                }
            }

            //update age of lot on disk
            var newAgelotStr = String.Join(",", newAgelot);
            writeFile(ageLotPath, newAgelotStr);
            return newAgelotStr;
        }

        private string writeHistory(string lot)
        {
            //read history of lot from disk
            int[] oldHistLot;
            try { oldHistLot = readFile(historicLotPath)?.Split(',').Select(x => int.Parse(x)).ToArray(); }
            catch { oldHistLot = new int[0]; }
            var newHistlot = new int[Math.Max(oldHistLot.Length, lot.Length)];

            //add current lot data to history
            for (int i = 0; i < newHistlot.Length; i++)
            {
                if (oldHistLot.Length > i)
                    newHistlot[i] = oldHistLot[i];
                if (lot.Length > i)
                    newHistlot[i] += int.Parse(lot[i].ToString());
            }

            //update history of lot on disk
            var newHistlotStr = String.Join(",", newHistlot);
            writeFile(historicLotPath, newHistlotStr);
            return newHistlotStr;
        }


        private static string readFile(string path)
        {
            string str = "";
            using (var sr = new StreamReader(path))
            {
                str = sr.ReadLine();
            }
            return str;
        }

        private static void writeFile(string path, string txt)
        {
            using (var sw = new StreamWriter(path))
            {
                sw.WriteLine(txt);
            }
        }

        private static string reverseString(string s)
        {
            char[] arr = s.ToCharArray();
            Array.Reverse(arr);
            return new string(arr);
        }
    }
}