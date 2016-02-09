using Microsoft.AspNet.SignalR;
using System;
using System.IO;
using System.Linq;
using System.Web.Mvc;

namespace Parking_Availability_Map.Controllers
{
    public class ApiController : Controller
    {     
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

            //handel hex inputs
            if (lot.StartsWith("0x"))
            {
                try
                {
                    lot = String.Join(String.Empty, lot.Substring(2).Select(
                        c => ReverseString(Convert.ToString(Convert.ToInt32(c.ToString(), 16), 2).PadLeft(4, '0'))
                    ));
                }
                catch { }
            }

            //push data to all clients
            var context = GlobalHost.ConnectionManager.GetHubContext<LotHub>();
            context.Clients.All.render(lot);

            //save current lot to disk
            writeFile(currentLotPath, lot);

            //read history of lot from disk
            int[] oldHistLot;
            try { oldHistLot = readFile(historicLotPath)?.Split(',').Select(x => int.Parse(x)).ToArray(); }
            catch { oldHistLot = new int[0]; }
            var newHistlot = new int[Math.Max(oldHistLot.Length, lot.Length)];

            //add cuurent lot data to history
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
            return "Lot History: \n\r" + newHistlotStr;
        }

        public string ClearHistory()
        {
            writeFile(historicLotPath, "0");
            return "Successfully Cleared!";
        }

        public string GetLot()
        {
            return readFile(currentLotPath);
        }

        //----------------------------------------------------------------

        //private string path = System.IO.Path.GetTempPath() + @"file.txt";

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

        private static string ReverseString(string s)
        {
            char[] arr = s.ToCharArray();
            Array.Reverse(arr);
            return new string(arr);
        }
    }
}