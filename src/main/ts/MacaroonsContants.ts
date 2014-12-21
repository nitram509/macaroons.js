/*
 * Copyright 2014 Martin W. Kirst
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
export = MacaroonsContants;
class MacaroonsContants {
  public static IDENTIFIER_CHARSET:string = "utf8";

  public static PACKET_PREFIX_LENGTH:number = 4;

  public static LINE_SEPARATOR_STR:string = '\n';
  public static LINE_SEPARATOR:number = MacaroonsContants.LINE_SEPARATOR_STR.charCodeAt(0);
  public static LINE_SEPARATOR_LEN:number = 1;

  public static KEY_VALUE_SEPARATOR_STR:string = ' ';
  public static KEY_VALUE_SEPARATOR:number = MacaroonsContants.KEY_VALUE_SEPARATOR_STR.charCodeAt(0);
  public static KEY_VALUE_SEPARATOR_LEN:number = 1;
}