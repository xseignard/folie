#include <SPI.h>
#include <Ethernet.h>
#include <EthernetUdp.h>
#include <DMD.h>
#include <TimerOne.h>
#include <Arial_Black_16_Extended.h>

// DMD stuff
#define DISPLAYS_ACROSS 5
#define DISPLAYS_DOWN 1
DMD dmd(DISPLAYS_ACROSS, DISPLAYS_DOWN);

// Ethernet/UDP stuff

// define a new size of max bytes of udp message
#define UDP_TX_PACKET_MAX_SIZE 860

byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
IPAddress ip(192, 168, 2, 2);
unsigned int localPort = 8888;
char packetBuffer[UDP_TX_PACKET_MAX_SIZE];
EthernetUDP Udp;

// timing stuff
// default interval for scrolling speed (in ms)
int interval = 30;
// last time check
unsigned long last;
// flag to check whether a marquee is ended or not
boolean marqueeEnd = false;
// flag to check if the first subtitle has been received
boolean firstSubReceived = false;
// width of the display
int width = 32*DISPLAYS_ACROSS;
// flag to indicates whether a marquee reached the end of the display
boolean reached = false;
// x offset where marquee starts
int xStartMarquee = width - 1;

void setup() {
  Ethernet.begin(mac, ip);
  Udp.begin(localPort);
  Timer1.initialize(1000);
  Timer1.attachInterrupt(ScanDMD);
  dmd.selectFont(Arial_Black_16_Extended);
  dmd.clearScreen(false);
  delay(500);
  dmd.clearScreen(true);
  delay(500);
  dmd.clearScreen(false);
  delay(500);
  dmd.clearScreen(true);
  Serial.begin(9600);
  //Serial.println(freeRam());
}

void loop() {
  int packetSize = Udp.parsePacket();
  if (packetSize) {
    Udp.read(packetBuffer, UDP_TX_PACKET_MAX_SIZE);
    Serial.println(packetBuffer);
    handlePacket(packetBuffer);
  }
  moveText();
  //delay(1);
}

void handlePacket(char* text) {
  //Serial.println(freeRam());
  if (text[0] == '#') {
    char tmp[] = {text[1], text[2], text[3]};
    interval = atoi(tmp);
  }
  else {
    dmd.drawMarquee(text, strlen(text), xStartMarquee, 0);
    if (marqueeEnd && firstSubReceived) marqueeEnd = false;
    if (!firstSubReceived) firstSubReceived = true;
    last = micros();
    Serial.println(text);
  }
}

void moveText() {
  unsigned long timer = micros();
  if(timer - last > interval && !marqueeEnd && firstSubReceived) {
    width--;
    last = timer;
    marqueeEnd = dmd.stepMarquee(-1,0);
    if (width == 0 && !reached) {
      reached = true;
      /*
      Udp.beginPacket(Udp.remoteIP(), Udp.remotePort());
      Udp.write(packetBuffer);
      Udp.endPacket();
      */
    }
    Serial.println(marqueeEnd);
    if (marqueeEnd) {
      width = 32*DISPLAYS_ACROSS;
      reached = false;
      Udp.beginPacket(Udp.remoteIP(), Udp.remotePort());
      Udp.write("marqueeEnd");
      Udp.endPacket();
      memset(packetBuffer, 0, sizeof(packetBuffer));
    }
  }
}

void ScanDMD() { 
  dmd.scanDisplayBySPI();
}

int freeRam () {
  extern int __heap_start, *__brkval; 
  int v; 
  return (int) &v - (__brkval == 0 ? (int) &__heap_start : (int) __brkval); 
}