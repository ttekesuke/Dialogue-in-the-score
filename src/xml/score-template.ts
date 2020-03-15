export namespace ScoreTemplate {
  export const XmlStrings: string = `
    <?xml version="1.0" encoding="UTF-8"?>
    <?xml-model href="http://music-encoding.org/schema/3.0.0/mei-all.rng" type="application/xml" schematypens="http://relaxng.org/ns/structure/1.0"?>
    <?xml-model href="http://music-encoding.org/schema/3.0.0/mei-all.rng" type="application/xml" schematypens="http://purl.oclc.org/dsdl/schematron"?>
    <mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="3.0.0">
      <music>
          <body>
                <mdiv>
                  <score>
                      <scoreDef>
                            <staffGrp symbol="brace" label="">
                              <staffDef clef.shape="G" clef.line="2" n="1" lines="5" />
                            </staffGrp>
                      </scoreDef>
                      <section>
                            <measure>
                                <staff>
                                    <layer n="1">
                                        <note xml:id="d594751e92" pname="b" oct="3" dur="8" stem.dir="up" accid.ges="f"/>
                                    </layer>
                                </staff>
                            </measure>
                      </section>
                  </score>
                </mdiv>
          </body>
      </music>
    </mei>`;
}
