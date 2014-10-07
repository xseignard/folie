const int pot = A0;

int current = -1;

void setup() {
  Serial.begin(9600);
}

void loop() {
  if (Serial.available() > 0) {
    char recieved = Serial.read();
    if (recieved == '#') {
      Serial.println(current);
    }
  }
  getPotentiometerValue();
}

void getPotentiometerValue() {
  int first = map(analogRead(pot), 0, 1023, 1, 99);
  delay(500);
  int second = map(analogRead(pot), 0, 1023, 1, 99);
  if(first == second && first != current) {
    current = first;
    Serial.println(current);
  }
}