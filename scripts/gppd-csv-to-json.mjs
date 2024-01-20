import * as fs from 'fs';
import { csvParse } from 'd3';

const gppdPath = './global_power_plant_database_v_1_3/global_power_plant_database.csv';
let gppd = csvParse(fs.readFileSync(gppdPath, 'utf8'));
fs.writeFileSync('./pages/data/global_power_plant_database.json', JSON.stringify(gppd));